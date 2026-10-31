import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/errors';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Handle unexpected internal server errors
  console.error('[Unhandled Error]:', err);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route '${req.method} ${req.originalUrl}' not found`,
  });
}
