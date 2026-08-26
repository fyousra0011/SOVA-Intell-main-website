import express from "express";
import { createRsvpRouter } from "./routes/rsvp.routes.js";
import { getPostgresPool, PostgresRsvpRepository, RsvpService, SqliteRsvpRepository } from "./services/rsvp.service.js";
import { SmtpRsvpNotifier } from "./services/email.service.js";
import { loadConfig, type AppConfig } from "./config.js";
import { createCorsMiddleware, permissionsPolicy, securityHeaders } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export interface AppOptions {
  frontendUrl?: string;
  rsvpService?: RsvpService;
  config?: AppConfig;
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const config = options.config ?? loadConfig();
  const frontendUrl = options.frontendUrl ?? config.FRONTEND_URL;
  const pool = !options.rsvpService && config.NODE_ENV === "production" ? getPostgresPool(config.DATABASE_URL) : undefined;
  const repository = options.rsvpService ? undefined : pool
    ? new PostgresRsvpRepository(pool)
    : new SqliteRsvpRepository(config.DATABASE_URL);
  const notifier = !options.rsvpService && config.SMTP_HOST
    ? new SmtpRsvpNotifier(config.notificationEmails, config.SMTP_FROM ?? config.SMTP_USER!, config)
    : undefined;
  const rsvpService = options.rsvpService ?? new RsvpService(repository!, notifier);

  app.set("trust proxy", config.TRUST_PROXY ? 1 : false);
  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(permissionsPolicy);
  app.use(createCorsMiddleware(frontendUrl));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/rsvp", createRsvpRouter(rsvpService, pool));
  app.use(notFoundHandler);
  app.use(errorHandler);
  app.locals.close = () => repository && "close" in repository && repository.close();

  return app;
}
