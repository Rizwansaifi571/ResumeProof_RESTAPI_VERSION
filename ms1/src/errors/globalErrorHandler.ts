import { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';
import { logger } from '../utils/logger';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Log unexpected errors
  logger.error('Unexpected Error:', err);

  res.status(500).json({ error: 'internal_server_error' });
};
