import { Request, Response, NextFunction } from 'express';
import { generateKeySchema } from '../schemas/keySchemas';
import * as apiKeyService from '../services/apiKeyService';
import { AppError } from '../errors/AppError';

export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = generateKeySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    
    if (!req.clientId) {
      throw new AppError('unauthorized', 401);
    }

    const { label, environment } = parseResult.data;
    const result = await apiKeyService.generateApiKey(req.clientId, label, environment);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) {
      throw new AppError('unauthorized', 401);
    }

    const keys = await apiKeyService.listClientKeys(req.clientId);
    res.status(200).json(keys);
  } catch (error) {
    next(error);
  }
};

export const revoke = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientId) {
      throw new AppError('unauthorized', 401);
    }

    const keyId = req.params.keyId as string;
    const result = await apiKeyService.revokeKey(req.clientId, keyId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
