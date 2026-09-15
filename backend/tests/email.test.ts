import { describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.js";
import { SmtpRsvpNotifier } from "../src/services/email.service.js";
import { RsvpService, type RsvpRepository } from "../src/services/rsvp.service.js";
import { PostgresRsvpRepository, migratePostgres } from "../src/services/rsvp.service.js";
import type { RsvpInput } from "../src/schemas/rsvp.schema.js";

const config = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  SMTP_USER: "mailer@example.com",
  SMTP_PASSWORD: "test-password",
};

const input: RsvpInput = {
  name: "Ada Lovelace",
  org: "SOVA Intelligence",
  title: "Director",
  email: "ada@example.com",
  phone: "+6019-1234567",
  queryType: "Partnership Opportunity",
  message: "Please contact me.",
  website: "",
};

class MemoryRepository implements RsvpRepository {
  records: RsvpInput[] = [];
  create(value: RsvpInput) { this.records.push(value); }
}

describe("SmtpRsvpNotifier", () => {
  it("sends one notification to the Workspace recipient", async () => {
    const sendMail = vi.fn().mockResolvedValue({ accepted: ["drsalasiah@sovaintell.com"] });
    const notifier = new SmtpRsvpNotifier(
      ["drsalasiah@sovaintell.com"],
      "mailer@example.com",
      config,
      { sendMail },
    );

    await notifier.notify(input);

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail.mock.calls[0][0]).toMatchObject({
      to: ["drsalasiah@sovaintell.com"],
      replyTo: "ada@example.com",
    });
  });

  it("propagates provider failures to the service without losing persistence", async () => {
    const repository = new MemoryRepository();
    const notifier = new SmtpRsvpNotifier(
      ["drsalasiah@sovaintell.com"],
      "mailer@example.com",
      config,
      { sendMail: vi.fn().mockRejectedValue(new Error("provider unavailable")) },
    );
    const result = await new RsvpService(repository, notifier).submit(input);

    expect(result).toEqual({ notificationSent: false });
    expect(repository.records).toHaveLength(1);
  });
});

describe("PostgresRsvpRepository", () => {
  it("uses parameterized insertion values", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresRsvpRepository({ query });

    await repository.create(input);

    expect(query).toHaveBeenCalledWith(expect.stringContaining("VALUES ($1, $2, $3, $4, $5, $6, $7)"), [
      input.name, input.email, input.phone, input.org, input.title, input.queryType, input.message,
    ]);
  });

  it("initializes the RSVP and shared rate-limit tables", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await migratePostgres({ query });

    expect(query.mock.calls[0][0]).toContain("CREATE TABLE IF NOT EXISTS rsvps");
    expect(query.mock.calls[0][0]).toContain("CREATE TABLE IF NOT EXISTS rsvp_rate_limits");
  });
});

describe("server configuration", () => {
  it("requires PostgreSQL and the single Workspace recipient in production", () => {
    expect(loadConfig({
      NODE_ENV: "production",
      FRONTEND_URL: "https://sovaintell.com",
      DATABASE_URL: "postgresql://user:password@host/db",
      SMTP_HOST: "smtp.gmail.com",
      SMTP_USER: "drsalasiah@sovaintell.com",
      SMTP_PASSWORD: "app-password",
      SMTP_FROM: "drsalasiah@sovaintell.com",
      RSVP_NOTIFICATION_EMAILS: "drsalasiah@sovaintell.com",
    }).notificationEmails).toEqual(["drsalasiah@sovaintell.com"]);
  });

  it("rejects SQLite in production", () => {
    expect(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: "./data/rsvps.db" })).toThrow(/Invalid server configuration/);
  });

  it("rejects partial SMTP configuration", () => {
    expect(() => loadConfig({
      NODE_ENV: "production",
      FRONTEND_URL: "https://sovaintell.com",
      SMTP_HOST: "smtp.example.com",
    })).toThrow(/Invalid server configuration/);
  });

  it("rejects invalid notification recipients", () => {
    expect(() => loadConfig({ RSVP_NOTIFICATION_EMAILS: "not-an-email" })).toThrow(/Invalid server configuration/);
  });
});
