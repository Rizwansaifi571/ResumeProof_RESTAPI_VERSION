import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as apiKeyRepository from '../repositories/apiKeyRepository';
import { AppError } from '../errors/AppError';

declare global {
  namespace Express {
    interface Request {
      client?: any; // Will hold the Prisma Client object
    }
  }
}

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawKey = req.headers['x-api-key'] as string | undefined;
    
    if (!rawKey) {
      throw new AppError('missing_api_key', 401);
    }

    const prefixMatch = rawKey.match(/^(rp_live_|rp_test_)/);
    if (!prefixMatch) {
      throw new AppError('invalid_api_key', 401);
    }
    
    const prefix = prefixMatch[1];

    const candidates = await apiKeyRepository.findActiveKeysByPrefix(prefix);

    let validKey: any = null;

    for (const candidate of candidates) {
      const isMatch = await bcrypt.compare(rawKey, candidate.keyHash);
      if (isMatch) {
        validKey = candidate;
        break;
      }
    }

    if (!validKey) {
      throw new AppError('invalid_api_key', 401);
    }

    req.clientId = validKey.clientId;
    req.client = validKey.client;

    // Fire and forget update last used
    apiKeyRepository.updateLastUsed(validKey.id).catch(err => {
      // Ignore
    });

    next();
  } catch (error) {
    next(error);
  }
};
