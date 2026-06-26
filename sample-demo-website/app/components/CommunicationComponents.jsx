import {
  communicationChannels,
  createConversation,
  createDeliveryReceipt,
  createMessage,
  createNotification,
  createStatusUpdate,
  createWebhookEvent,
  messageStatuses
} from "../../lib/communication";
import { createEmailJob } from "../../lib/email-adapter";

export function CommunicationOverview() {
  return (
    <section className="component-card">
      <p className="component-label">Communication channels</p>
      <div className="split-list">
        {communicationChannels.map((channel) => (
          <span key={channel.key}>
            <strong>{channel.label}</strong>
            {channel.async ? "Queued delivery model" : "Realtime in-app model"}
            <small>{channel.key}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function ConversationPanel() {
  const conversation = createConversation({
    participantIds: ["client-preview", "manager-preview"],
    subject: "Account follow-up"
  });

  return (
    <section className="component-card">
      <p className="component-label">Conversation record</p>
      <h2>{conversation.status}</h2>
      <p>{conversation.subject}</p>
      <dl className="mini-definition-list">
        <div>
          <dt>Participants</dt>
          <dd>{conversation.participantIds.length} account users</dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>Client and assigned manager</dd>
        </div>
      </dl>
    </section>
  );
}

export function MessageComposerPanel() {
  const message = createMessage({
    conversationId: "conversation-preview",
    body: "Thanks for the update."
  });

  return (
    <section className="component-card">
      <p className="component-label">Message composer</p>
      <form className="form-stack">
        <label>
          Message
          <textarea defaultValue={message.body} />
        </label>
        <label>
          Internal note
          <input placeholder="Optional manager-only note" />
        </label>
        <button type="button">Preview message</button>
      </form>
      <p className="microcopy">This stores a visual queue item only. It does not send email or SMS.</p>
    </section>
  );
}

export function NotificationTemplatePanel() {
  const notification = createNotification({
    userId: "client-preview",
    title: "Request updated",
    body: "Your request status changed."
  });

  return (
    <section className="component-card">
      <p className="component-label">Notification template</p>
      <h2>{notification.level}</h2>
      <p>{notification.title}</p>
      <div className="toast-stack">
        <span>{notification.body}</span>
        <span>Shown in notification center and activity history</span>
      </div>
    </section>
  );
}

export function EmailTemplatePanel() {
  const job = createEmailJob({
    template: "contactConfirmation",
    to: "client@example.com",
    payload: { email: "client@example.com", name: "Client" }
  });

  return (
    <section className="component-card">
      <p className="component-label">Email queue</p>
      <h2>{job.status}</h2>
      <p>{job.subject}</p>
      <div className="split-list">
        <span><strong>Template</strong>{job.template}</span>
        <span><strong>Recipient</strong>{job.to}</span>
        <span><strong>Provider</strong>Not connected in template mode</span>
      </div>
    </section>
  );
}

export function StatusUpdatePanel() {
  const update = createStatusUpdate({
    targetId: "request-preview",
    status: "review",
    message: "A manager is reviewing the request."
  });

  return (
    <section className="component-card">
      <p className="component-label">Status updates</p>
      <h2>{update.status}</h2>
      <p>{update.message}</p>
      <div className="button-row">
        <button type="button">Preview client update</button>
        <button className="secondary-button" type="button">Save internal only</button>
      </div>
    </section>
  );
}

export function WebhookEventPanel() {
  const event = createWebhookEvent({
    provider: "email-provider",
    eventType: "message.delivered"
  });

  return (
    <section className="component-card">
      <p className="component-label">Webhook events</p>
      <h2>{event.status}</h2>
      <p>{event.provider}: {event.eventType}</p>
      <div className="detail-grid">
        <span><strong>Signed</strong> Validation slot</span>
        <span><strong>Logged</strong> Event audit</span>
      </div>
    </section>
  );
}

export function DeliveryReceiptPanel() {
  const receipt = createDeliveryReceipt({
    messageId: "message-preview",
    channel: "email"
  });

  return (
    <section className="component-card">
      <p className="component-label">Delivery receipts</p>
      <h2>{receipt.status}</h2>
      <p>Message status lifecycle: {messageStatuses.join(", ")}</p>
      <div className="pipeline pipeline-stacked">
        {messageStatuses.map((status, index) => (
          <span key={status}>
            <strong>{index + 1}</strong>
            {status}
          </span>
        ))}
      </div>
    </section>
  );
}
