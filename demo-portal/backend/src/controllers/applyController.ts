import { Request, Response, NextFunction } from 'express';
import { applySchema } from '../schemas/applySchema';
import * as applicationService from '../services/applicationService';
import { AppError } from '../errors/AppError';

export const apply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('resume_required', 400);
    }

    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('invalid_input: ' + parsed.error.message, 400);
    }

    const applicationId = await applicationService.submitApplication({
      ...parsed.data,
      resumeFilename: req.file.filename
    });

    res.status(201).json({ message: 'application_received', applicationId });
  } catch (error) {
    next(error);
  }
};

export const checkStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await applicationService.checkApplicationStatus(req.params.applicationId);
    res.json(app);
  } catch (error) {
    next(error);
  }
};
