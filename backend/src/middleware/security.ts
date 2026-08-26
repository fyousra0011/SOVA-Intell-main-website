import cors from "cors";
import helmet from "helmet";
import type { RequestHandler } from "express";
import { HttpError } from "./errorHandler.js";

export function createCorsMiddleware(frontendUrl: string): RequestHandler {
  const allowedOrigins = new Set(
    frontendUrl.split(",").map((origin) => origin.trim()).filter(Boolean),
  );

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, "Origin is not allowed."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });
}

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: process.env.NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

export const permissionsPolicy: RequestHandler = (_request, response, next) => {
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};
