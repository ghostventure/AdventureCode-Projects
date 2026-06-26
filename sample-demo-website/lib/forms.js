import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["client", "manager"])
});

export const requestSchema = z.object({
  type: z.string().min(2),
  notes: z.string().min(5)
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10)
});

export const dataRequestSchema = z.object({
  email: z.string().email(),
  requestType: z.enum(["access", "delete", "correct", "export"]),
  details: z.string().min(10)
});

export function validateWithSchema(schema, values) {
  const result = schema.safeParse(values);

  if (result.success) {
    return { ok: true, data: result.data, errors: [] };
  }

  return {
    ok: false,
    data: null,
    errors: result.error.issues.map((issue) => issue.message)
  };
}
