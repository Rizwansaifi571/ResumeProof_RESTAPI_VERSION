import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const internalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.header('X-Internal-Secret');
  
  if (!secret || secret !== env.INTERNAL_SECRET) {
    res.status(401).json({ error: 'unauthorized_internal' });
    return;
  }
  
  next();
};
