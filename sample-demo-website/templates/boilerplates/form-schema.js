import { z } from "zod";

export const templateFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  notes: z.string().optional()
});

export function validateTemplateForm(values) {
  return templateFormSchema.safeParse(values);
}
