import type { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ success: false, message: "Not found." });
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    console.warn("Malformed JSON request", { method: request.method, path: request.path });
    response.status(400).json({ success: false, message: "Malformed JSON request." });
    return;
  }

  const errorStatus = typeof error === "object" && error !== null && "status" in error
    ? (error as { status?: unknown }).status
    : undefined;
  const statusCode = error instanceof HttpError
    ? error.statusCode
    : typeof errorStatus === "number" && errorStatus >= 400 && errorStatus < 500 ? errorStatus : 500;
  const message = statusCode === 413 ? "Request body is too large." : error instanceof HttpError ? error.message : "Internal server error.";

  if (statusCode >= 500) {
    console.error("Unhandled server error", { method: request.method, path: request.path, error });
  }

  response.status(statusCode).json({ success: false, message });
};
