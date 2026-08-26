import nodemailer from "nodemailer";
import type { RsvpInput } from "../schemas/rsvp.schema.js";
import type { AppConfig } from "../config.js";
import type { RsvpNotifier } from "./rsvp.service.js";

export interface MailTransport {
  sendMail(options: {
    from: string;
    to: string[];
    replyTo: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
}

export class SmtpRsvpNotifier implements RsvpNotifier {
  private readonly transporter: MailTransport;

  constructor(
    private readonly recipients: string[],
    private readonly fromAddress: string,
    config: Pick<AppConfig, "SMTP_HOST" | "SMTP_PORT" | "SMTP_SECURE" | "SMTP_USER" | "SMTP_PASSWORD">,
    transport?: MailTransport,
  ) {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASSWORD) {
      throw new Error("SMTP configuration is incomplete.");
    }

    this.transporter = transport ?? nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    });
  }

  async notify(input: RsvpInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: this.recipients,
      replyTo: input.email,
      subject: `New SOVA enquiry from ${input.name}`,
      text: [
        "A new SOVA Intelligence enquiry was submitted.",
        "",
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Organisation: ${input.org}`,
        `Job title: ${input.title}`,
        `Phone: ${input.phone || "Not provided"}`,
        `Nature of enquiry: ${input.queryType}`,
        `Message: ${input.message || "Not provided"}`,
      ].join("\n"),
    });
  }
}
