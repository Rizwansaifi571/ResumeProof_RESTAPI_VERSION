import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { redis } from '../config/redisClient';
import * as clientService from '../services/clientService';

export const getUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) throw new AppError('unauthorized', 401);
    
    const profile = await clientService.getProfile(req.clientId);
    
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const quotaKey = `rp:quota:${req.clientId}:${yearMonth}`;
    
    const usedStr = await redis.get(quotaKey);
    const used = usedStr ? parseInt(usedStr, 10) : 0;
    
    res.status(200).json({
      used,
      quota: profile.monthlyQuota,
      period: yearMonth
    });
  } catch (error) {
    next(error);
  }
};
