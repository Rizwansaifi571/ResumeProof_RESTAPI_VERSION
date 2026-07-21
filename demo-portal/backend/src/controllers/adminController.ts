import { Request, Response, NextFunction } from 'express';
import * as applicationService from '../services/applicationService';

export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apps = await applicationService.getAllApplications();
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByJobId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apps = await applicationService.getApplicationsByJob(req.params.jobId);
    res.json(apps);
  } catch (error) {
    next(error);
  }
};
