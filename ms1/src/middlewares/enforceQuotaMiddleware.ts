import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { redis } from '../config/redisClient';

export const enforceQuotaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.clientId;
    if (!clientId) {
      throw new AppError('unauthorized', 401);
    }

    const client = req.client;
    if (!client) {
      throw new AppError('unauthorized', 401);
    }

    const maxQuota = client.monthlyQuota;
    
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const quotaKey = `rp:quota:${clientId}:${yearMonth}`;

    const currentUsage = await redis.incr(quotaKey);
    
    if (currentUsage === 1) {
      const ttlSeconds = 40 * 24 * 60 * 60; // 40 days
      await redis.expire(quotaKey, ttlSeconds);
    }

    if (currentUsage > maxQuota) {
      throw new AppError('quota_exceeded', 429);
    }

    next();
  } catch (error) {
    next(error);
  }
};
