import { Queue } from 'bullmq';
import { env } from '../config/env';

export const verificationQueue = new Queue('verification-queue', {
  connection: {
    url: env.REDIS_URL
  }
});

export const enqueueVerificationJob = async (transactionId: string) => {
  return verificationQueue.add('verify', { transactionId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  });
};

export const getQueueStats = async () => {
  const counts = await verificationQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
  return counts;
};
