import { requestBackendJson } from "./backend-api.js";

async function readAuthToken(auth) {
  const user = auth && auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in first.");
  }
  return user.getIdToken();
}

async function requestJson(endpointKey, options) {
  try {
    return await requestBackendJson(endpointKey, options);
  } catch (error) {
    throw new Error(error.message || "Stripe services require the Blaze backend setup and are temporarily disabled.");
  }
}

export async function getStripeConfig() {
  try {
    const payload = await requestJson("stripeConfig", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    return {
      ready: !!payload.ready,
      publishableKey: payload.publishableKey || ""
    };
  } catch (error) {
    return {
      ready: false,
      publishableKey: "",
      error: error.message || "Stripe is not configured yet."
    };
  }
}

export async function prepareStripeConnectedAccount({ auth, role }) {
  const token = await readAuthToken(auth);
  const payload = await requestJson("stripeCreateConnectedAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  return payload;
}

export async function createStripeOnboardingLink({ auth, role }) {
  const token = await readAuthToken(auth);
  const payload = await requestJson("stripeCreateOnboardingLink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  return payload;
}

export async function startStripeOnboarding({ auth, role }) {
  await prepareStripeConnectedAccount({ auth, role });
  const payload = await createStripeOnboardingLink({ auth, role });
  if (!payload.url) {
    throw new Error("Stripe onboarding link was not returned.");
  }
  window.location.href = payload.url;
}

export async function createHostCheckoutIntent({ auth, gigId, performerId }) {
  const token = await readAuthToken(auth);
  return requestJson("stripeCreateHostCheckoutIntent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ gigId, performerId })
  });
}
