import rateLimit from "express-rate-limit";
import type { Pool } from "pg";

class PostgresRateLimitStore {
  constructor(private readonly pool: Pick<Pool, "query">) {}

  async increment(key: string) {
    const result = await this.pool.query<{ hits: number; expires_at: Date }>(
      `INSERT INTO rsvp_rate_limits (key, hits, expires_at)
       VALUES ($1, 1, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN rsvp_rate_limits.expires_at <= CURRENT_TIMESTAMP THEN 1 ELSE rsvp_rate_limits.hits + 1 END,
         expires_at = CASE WHEN rsvp_rate_limits.expires_at <= CURRENT_TIMESTAMP
           THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE rsvp_rate_limits.expires_at END
       RETURNING hits, expires_at`,
      [key],
    );
    return { totalHits: result.rows[0].hits, resetTime: new Date(result.rows[0].expires_at) };
  }

  async decrement(key: string): Promise<void> {
    await this.pool.query("UPDATE rsvp_rate_limits SET hits = GREATEST(hits - 1, 0) WHERE key = $1", [key]);
  }

  async resetKey(key: string): Promise<void> {
    await this.pool.query("DELETE FROM rsvp_rate_limits WHERE key = $1", [key]);
  }
}

export function createRsvpRateLimit(pool?: Pick<Pool, "query">) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: pool ? new PostgresRateLimitStore(pool) : undefined,
    message: {
      success: false,
      message: "Too many RSVP submissions. Please try again later.",
    },
  });
}
