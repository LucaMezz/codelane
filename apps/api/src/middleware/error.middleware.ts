import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        issues: error.issues,
      },
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
};
