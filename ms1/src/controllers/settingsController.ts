import { Request, Response, NextFunction } from 'express';
import { webhookSchema } from '../schemas/settingsSchemas';
import * as clientService from '../services/clientService';
import { AppError } from '../errors/AppError';

export const updateWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) throw new AppError('unauthorized', 401);
    
    const parseResult = webhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    
    const result = await clientService.setWebhookConfig(req.clientId, parseResult.data.webhookUrl);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) throw new AppError('unauthorized', 401);
    
    const profile = await clientService.getProfile(req.clientId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
