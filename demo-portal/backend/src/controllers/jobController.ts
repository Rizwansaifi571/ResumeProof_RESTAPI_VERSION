import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/jobService';

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobService.getJobs();
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
};
