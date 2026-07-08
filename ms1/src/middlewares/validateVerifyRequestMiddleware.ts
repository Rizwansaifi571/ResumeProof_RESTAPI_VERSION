import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { validatePdfMagicBytes } from '../utils/validatePdfMagicBytes';
import { verifyRequestSchema } from '../schemas/verifySchemas';

export const validateVerifyRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('resume_file_missing', 400);
    }

    if (!validatePdfMagicBytes(req.file.buffer)) {
      throw new AppError('invalid_pdf_format', 400);
    }

    const parseResult = verifyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
