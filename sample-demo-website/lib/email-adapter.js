export const emailTemplates = Object.freeze({
  inviteUser: {
    subject: "You have been invited",
    requiredFields: ["email", "role", "inviteUrl"]
  },
  passwordReset: {
    subject: "Reset your password",
    requiredFields: ["email", "resetUrl"]
  },
  clientNotice: {
    subject: "Account update",
    requiredFields: ["email", "message"]
  },
  managerAlert: {
    subject: "Manager alert",
    requiredFields: ["email", "summary"]
  },
  contactConfirmation: {
    subject: "We received your message",
    requiredFields: ["email", "name"]
  },
  statusUpdate: {
    subject: "Status update",
    requiredFields: ["email", "status", "message"]
  }
});

export function createEmailJob({ template, to, payload = {} }) {
  const definition = emailTemplates[template];

  if (!definition) {
    throw new Error(`Unknown email template: ${template}`);
  }

  return {
    template,
    to,
    subject: definition.subject,
    payload,
    status: "queued",
    createdAt: new Date().toISOString()
  };
}
