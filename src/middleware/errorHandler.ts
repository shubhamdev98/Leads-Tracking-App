import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/errors';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isApi = req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json');

  if (err instanceof AppError) {
    if (isApi) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        details: err.details,
      });
      return;
    }

    res.status(err.statusCode).render('error', {
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
      title: `Error ${err.statusCode}`,
    });
    return;
  }

  // Handle unexpected internal server errors
  console.error('[Unhandled Error]:', err);

  if (isApi) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
    return;
  }

  res.status(500).render('error', {
    statusCode: 500,
    message: 'An unexpected internal server error occurred.',
    details: undefined,
    title: 'Server Error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  const isApi = req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json');

  if (isApi) {
    res.status(404).json({
      success: false,
      error: `Route '${req.method} ${req.originalUrl}' not found`,
    });
    return;
  }

  res.status(404).render('error', {
    statusCode: 404,
    message: `Page not found: ${req.originalUrl}`,
    details: undefined,
    title: 'Page Not Found',
  });
}
