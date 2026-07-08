import cron from 'node-cron';
import { getPrismaClient } from '../config/prismaClient';
import { logger } from '../utils/logger';

const prisma = getPrismaClient();

export const clearOldResumeText = async (cutoffDays = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);

    const result = await prisma.transaction.updateMany({
      where: {
        resumeText: { not: null },
        createdAt: { lt: cutoffDate }
      },
      data: {
        resumeText: null
      }
    });

    logger.info(`Cleanup Job: Cleared resumeText for ${result.count} transactions older than ${cutoffDays} days.`);
  } catch (error) {
    logger.error('Failed to clear old resume text', error);
  }
};

export const startCleanupJob = () => {
  // Run nightly at 2 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('Starting nightly cleanup job...');
    clearOldResumeText(30);
  });
};
