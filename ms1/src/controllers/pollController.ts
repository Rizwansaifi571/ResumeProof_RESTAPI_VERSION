import { Request, Response, NextFunction } from 'express';
import * as verificationService from '../services/verificationService';
import { AppError } from '../errors/AppError';

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) throw new AppError('unauthorized', 401);
    
    const trackingId = req.params.trackingId as string;
    
    const status = await verificationService.getVerificationStatus(req.clientId, trackingId);
    
    if (status.status === 'pending' || status.status === 'processing') {
      res.status(202).json(status);
    } else {
      res.status(200).json(status);
    }
  } catch (error) {
    next(error);
  }
};
