import { loadConfig } from "./config.js";
import { getPostgresPool, migratePostgres } from "./services/rsvp.service.js";

const config = loadConfig({ ...process.env, NODE_ENV: "development" });
if (!config.DATABASE_URL.startsWith("postgres")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string to run migrations.");
}

const pool = getPostgresPool(config.DATABASE_URL);
await migratePostgres(pool);
await pool.end();
console.info("PostgreSQL migrations applied");