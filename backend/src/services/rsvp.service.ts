import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolClient } from "pg";
import type { RsvpInput } from "../schemas/rsvp.schema.js";

export interface RsvpRepository {
  create(input: RsvpInput): void | Promise<void>;
}

export class SqliteRsvpRepository implements RsvpRepository {
  private readonly database: Database.Database;
  private readonly insertRsvp: Database.Statement;

  constructor(databaseUrl = "./data/rsvps.db") {
    const databasePath = path.resolve(process.cwd(), databaseUrl);
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.database = new Database(databasePath);
    this.database.pragma("journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        organization TEXT NOT NULL,
        job_title TEXT NOT NULL,
        query_type TEXT NOT NULL,
        message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    this.insertRsvp = this.database.prepare(`
      INSERT INTO rsvps (name, email, phone, organization, job_title, query_type, message)
      VALUES (@name, @email, @phone, @org, @title, @queryType, @message)
    `);
  }

  create(input: RsvpInput): void {
    this.insertRsvp.run({
      ...input,
      phone: input.phone || null,
      message: input.message || null,
    });
  }

  close(): void {
    this.database.close();
  }
}

export class PostgresRsvpRepository implements RsvpRepository {
  constructor(private readonly pool: Pick<Pool, "query">) {}

  async create(input: RsvpInput): Promise<void> {
    await this.pool.query(
      `INSERT INTO rsvps (name, email, phone, organization, job_title, query_type, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [input.name, input.email, input.phone || null, input.org, input.title, input.queryType, input.message || null],
    );
  }
}

let sharedPool: Pool | undefined;

export function getPostgresPool(databaseUrl: string): Pool {
  sharedPool ??= new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  return sharedPool;
}

export async function migratePostgres(pool: PoolClient | Pick<Pool, "query">): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(254) NOT NULL,
      phone VARCHAR(40),
      organization VARCHAR(160) NOT NULL,
      job_title VARCHAR(120) NOT NULL,
      query_type VARCHAR(100) NOT NULL,
      message VARCHAR(2000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON rsvps (created_at DESC);
    CREATE TABLE IF NOT EXISTS rsvp_rate_limits (
      key TEXT PRIMARY KEY,
      hits INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
}

export interface RsvpNotifier {
  notify(input: RsvpInput): Promise<void>;
}

export class NoopRsvpNotifier implements RsvpNotifier {
  async notify(_input: RsvpInput): Promise<void> {
    // Email notifications can be added behind this interface without changing the API.
  }
}

export class RsvpService {
  constructor(
    private readonly repository: RsvpRepository,
    private readonly notifier: RsvpNotifier = new NoopRsvpNotifier(),
  ) {}

  async submit(input: RsvpInput): Promise<{ notificationSent: boolean }> {
    await this.repository.create(input);
    try {
      await this.notifier.notify(input);
      return { notificationSent: true };
    } catch (error) {
      console.error("RSVP notification failed after persistence", {
        error: error instanceof Error ? error.message : "Unknown notification error",
      });
      return { notificationSent: false };
    }
  }
}
