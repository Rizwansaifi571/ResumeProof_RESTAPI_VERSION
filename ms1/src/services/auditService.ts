import { getPrismaClient } from '../config/prismaClient';
import { logger } from '../utils/logger';

const prisma = getPrismaClient();

export const logEvent = (clientId: string | null, event: string, metadata?: any, ipAddress?: string) => {
  // Fire and forget, swallow errors
  prisma.auditLog.create({
    data: {
      clientId,
      event,
      metadata: metadata || {},
      ipAddress
    }
  }).catch((err) => {
    logger.error('Failed to write audit log', err);
  });
};
