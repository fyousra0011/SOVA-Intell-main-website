import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const rsvpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  org: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: optionalText(40),
  queryType: z.string().trim().min(1).max(100),
  message: optionalText(2000),
  website: optionalText(200),
}).strict();

export type RsvpInput = z.infer<typeof rsvpSchema>;
