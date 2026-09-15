import { Router } from "express";
import { createRsvpController } from "../controllers/rsvp.controller.js";
import { createRsvpRateLimit } from "../middleware/rateLimit.js";
import { RsvpService } from "../services/rsvp.service.js";
import type { Pool } from "pg";

export function createRsvpRouter(service: RsvpService, pool?: Pick<Pool, "query">): Router {
  const router = Router();
  router.post("/", createRsvpRateLimit(pool), createRsvpController(service));
  return router;
}
