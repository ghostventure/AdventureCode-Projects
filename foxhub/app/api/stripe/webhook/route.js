import {
  getAdminDb,
  jsonResponse,
  serverTimestamp,
  verifyStripeSignature
} from "../../_server/foxhub-server.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const rawBodyText = await request.text();
  const stripeSignature = request.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const verification = verifyStripeSignature({
    rawBodyText,
    stripeSignature,
    webhookSecret
  });

  let eventPayload = {};
  try {
    eventPayload = JSON.parse(rawBodyText || "{}");
  } catch {
    eventPayload = {};
  }

  const eventId = String(eventPayload?.id || `evt_${Date.now()}`);
  const eventType = String(eventPayload?.type || "unknown");
  const createdEpoch = Number(eventPayload?.created || 0);
  const customerId = String(eventPayload?.data?.object?.customer || "");
  const subscriptionId = String(eventPayload?.data?.object?.id || "");

  const db = getAdminDb();
  await db.collection("stripeWebhookEvents").doc(eventId).set(
    {
      eventId,
      eventType,
      customerId,
      subscriptionId,
      livemode: Boolean(eventPayload?.livemode),
      createdEpoch,
      verified: verification.ok,
      verificationReason: verification.reason,
      backend: "next-api",
      receivedAt: serverTimestamp(),
      payload: eventPayload
    },
    { merge: true }
  );

  if (eventType.startsWith("customer.subscription.")) {
    await db.collection("billingSubscriptionEvents").add({
      source: "stripe",
      eventId,
      eventType,
      customerId,
      subscriptionId,
      verified: verification.ok,
      backend: "next-api",
      createdAt: serverTimestamp()
    });
  }

  return jsonResponse({
    ok: true,
    received: true,
    eventId,
    eventType,
    verified: verification.ok,
    verificationReason: verification.reason,
    backend: "next-api",
    webhookSecretConfigured: Boolean(webhookSecret)
  });
}

export async function GET() {
  return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
}
