import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { RsvpService, type RsvpRepository } from "../src/services/rsvp.service.js";

const validRsvp = {
  name: " Ada Lovelace ",
  org: "SOVA Intelligence",
  title: "Director",
  email: "ADA@EXAMPLE.COM",
  phone: "+6019-1234567",
  queryType: "Partnership Opportunity",
  message: "Please contact me.",
  website: "",
};

class MemoryRepository implements RsvpRepository {
  public records: unknown[] = [];
  create(input: unknown): void {
    this.records.push(input);
  }
}

function createTestApp(repository = new MemoryRepository()) {
  return {
    app: createApp({
      frontendUrl: "https://allowed.example",
      rsvpService: new RsvpService(repository),
    }),
    repository,
  };
}

describe("API health and security", () => {
  it("returns a minimal health response and security headers", async () => {
    const { app } = createTestApp();
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["permissions-policy"]).toContain("camera=()");
  });

  it("rejects an unexpected browser origin", async () => {
    const { app } = createTestApp();
    const response = await request(app).get("/api/health").set("Origin", "https://unexpected.example");

    expect(response.status).toBe(403);
  });
});

describe("POST /api/rsvp", () => {
  it("stores a valid normalized RSVP", async () => {
    const { app, repository } = createTestApp();
    const response = await request(app).post("/api/rsvp").send(validRsvp);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true, message: "RSVP submitted successfully." });
    expect(repository.records[0]).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" });
  });

  it("rejects missing fields, invalid email, and oversized input", async () => {
    const { app } = createTestApp();
    const missing = await request(app).post("/api/rsvp").send({});
    const invalidEmail = await request(app).post("/api/rsvp").send({ ...validRsvp, email: "invalid" });
    const oversized = await request(app).post("/api/rsvp").send({ ...validRsvp, message: "x".repeat(2001) });

    expect(missing.status).toBe(422);
    expect(invalidEmail.status).toBe(422);
    expect(oversized.status).toBe(422);
  });

  it("rejects malformed JSON and oversized request bodies", async () => {
    const { app } = createTestApp();
    const malformed = await request(app).post("/api/rsvp").set("Content-Type", "application/json").send("{");
    const oversized = await request(app).post("/api/rsvp").set("Content-Type", "application/json").send(JSON.stringify({ message: "x".repeat(101 * 1024) }));

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
  });

  it("does not store honeypot submissions", async () => {
    const { app, repository } = createTestApp();
    const response = await request(app).post("/api/rsvp").send({ ...validRsvp, website: "https://spam.example" });

    expect(response.status).toBe(200);
    expect(repository.records).toHaveLength(0);
  });

  it("returns 429 after the RSVP limit is exceeded", async () => {
    const { app } = createTestApp();
    const responses = await Promise.all(Array.from({ length: 9 }, () => request(app).post("/api/rsvp").send(validRsvp)));

    expect(responses.at(-1)?.status).toBe(429);
  });
});
