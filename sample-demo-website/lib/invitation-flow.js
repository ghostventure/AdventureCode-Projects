import { inviteUserSchema, validateWithSchema } from "./forms";

export function createInvitation(values, actorId = "manager") {
  const validation = validateWithSchema(inviteUserSchema, values);

  if (!validation.ok) {
    return { ok: false, errors: validation.errors, invitation: null };
  }

  return {
    ok: true,
    errors: [],
    invitation: {
      ...validation.data,
      invitedBy: actorId,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  };
}
