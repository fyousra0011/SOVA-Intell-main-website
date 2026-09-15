import type { RequestHandler } from "express";
import { rsvpSchema } from "../schemas/rsvp.schema.js";
import { RsvpService } from "../services/rsvp.service.js";

export function createRsvpController(service: RsvpService): RequestHandler {
  return async (request, response, next) => {
    const result = rsvpSchema.safeParse(request.body);

    if (!result.success) {
      console.warn("RSVP validation failed", {
        method: request.method,
        path: request.path,
        fields: Object.keys(result.error.flatten().fieldErrors),
      });
      response.status(422).json({
        success: false,
        message: "Invalid request.",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    if (result.data.website) {
      console.warn("RSVP honeypot triggered", { method: request.method, path: request.path });
      response.status(200).json({ success: true, message: "RSVP submitted successfully." });
      return;
    }

    try {
      const { notificationSent } = await service.submit(result.data);
      console.info("RSVP received", { method: request.method, path: request.path });
      response.status(201).json({
        success: true,
        message: notificationSent
          ? "RSVP submitted successfully."
          : "RSVP submitted successfully. Notification delivery is pending.",
      });
    } catch (error) {
      next(error);
    }
  };
}
