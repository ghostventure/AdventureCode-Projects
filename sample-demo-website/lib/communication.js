export const communicationChannels = [
  { key: "email", label: "Email", async: true },
  { key: "sms", label: "SMS", async: true },
  { key: "portal", label: "Portal message", async: false },
  { key: "webhook", label: "Webhook", async: true },
  { key: "system", label: "System alert", async: false }
];

export const messageStatuses = ["draft", "queued", "sent", "delivered", "read", "failed", "archived"];

export function createConversation({ participantIds = [], subject, channel = "portal" }) {
  return {
    participantIds,
    subject,
    channel,
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createMessage({ conversationId, senderId = "system", body, channel = "portal", attachments = [] }) {
  return {
    conversationId,
    senderId,
    body,
    channel,
    attachments,
    status: "sent",
    createdAt: new Date().toISOString()
  };
}

export function createNotification({ userId, title, body, level = "info", actionUrl = "/" }) {
  return {
    userId,
    title,
    body,
    level,
    actionUrl,
    status: "unread",
    createdAt: new Date().toISOString()
  };
}

export function createStatusUpdate({ targetId, targetType = "request", status, message }) {
  return {
    targetId,
    targetType,
    status,
    message,
    createdAt: new Date().toISOString()
  };
}

export function createWebhookEvent({ provider, eventType, payload = {} }) {
  return {
    provider,
    eventType,
    payload,
    status: "received",
    receivedAt: new Date().toISOString()
  };
}

export function createDeliveryReceipt({ messageId, channel, status = "delivered" }) {
  return {
    messageId,
    channel,
    status,
    recordedAt: new Date().toISOString()
  };
}
