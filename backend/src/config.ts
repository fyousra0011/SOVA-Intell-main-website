import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  FRONTEND_URL: z.string().min(1).default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1).default("./data/rsvps.db"),
  TRUST_PROXY: booleanFromEnv.default("false"),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: booleanFromEnv.default("false"),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_FROM: z.string().email().optional(),
  RSVP_NOTIFICATION_EMAILS: z.string().min(1).default("drsalasiah@sovaintell.com"),
}).superRefine((env, context) => {
  const smtpFields = [env.SMTP_HOST, env.SMTP_USER, env.SMTP_PASSWORD];
  if (smtpFields.some(Boolean) && smtpFields.some((value) => !value)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SMTP_HOST"],
      message: "SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be configured together.",
    });
  }

  if (env.NODE_ENV === "production" && smtpFields.some((value) => !value)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SMTP_HOST"],
      message: "SMTP configuration is required in production.",
    });
  }

  if (env.NODE_ENV === "production" && !env.DATABASE_URL.startsWith("postgres")) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DATABASE_URL"],
      message: "DATABASE_URL must be a PostgreSQL connection string in production.",
    });
  }

  const recipients = env.RSVP_NOTIFICATION_EMAILS.split(",").map((email) => email.trim()).filter(Boolean);
  if (recipients.length === 0 || recipients.some((email) => !z.string().email().safeParse(email).success)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RSVP_NOTIFICATION_EMAILS"],
      message: "RSVP_NOTIFICATION_EMAILS must be a comma-separated list of valid email addresses.",
    });
  }
  if (recipients.length !== 1 || recipients[0] !== "drsalasiah@sovaintell.com") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RSVP_NOTIFICATION_EMAILS"],
      message: "RSVP_NOTIFICATION_EMAILS must contain only drsalasiah@sovaintell.com.",
    });
  }
});

export type AppConfig = z.infer<typeof envSchema> & { notificationEmails: string[] };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".") || "environment").join(", ");
    throw new Error(`Invalid server configuration: ${fields}`);
  }

  return {
    ...parsed.data,
    notificationEmails: parsed.data.RSVP_NOTIFICATION_EMAILS.split(",").map((email) => email.trim()).filter(Boolean),
  };
}
