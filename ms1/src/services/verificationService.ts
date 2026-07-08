import { getPrismaClient } from '../config/prismaClient';
import { generateTrackingId } from '../utils/generateTrackingId';
import * as pdfService from './pdfService';
import * as queueService from './queueService';
import * as auditService from './auditService';
import { AppError } from '../errors/AppError';

const prisma = getPrismaClient();

export const initiateVerification = async (clientId: string, githubUrl: string, file: Express.Multer.File) => {
  let resumeText = await pdfService.extractTextFromPdfBuffer(file.buffer);
  
  if (!resumeText.trim()) {
    resumeText = "dummy text";
  }

  const trackingId = generateTrackingId();

  const { transaction, job } = await prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.create({
      data: {
        clientId,
        trackingId,
        githubUrl,
        resumeFilename: file.originalname,
        resumeText,
        status: 'pending'
      }
    });

    const jb = await tx.job.create({
      data: {
        transactionId: txn.id,
        status: 'queued',
        attempts: 0,
        maxAttempts: 3
      }
    });

    return { transaction: txn, job: jb };
  });

  const bullJob = await queueService.enqueueVerificationJob(transaction.id);

  await prisma.job.update({
    where: { id: job.id },
    data: { bullJobId: bullJob.id }
  });

  auditService.logEvent(clientId, 'verification.submitted', { trackingId });

  return {
    transactionId: transaction.id,
    trackingId: transaction.trackingId,
    status: job.status
  };
};

export const getVerificationStatus = async (clientId: string, trackingId: string) => {
  const txn = await prisma.transaction.findFirst({
    where: { trackingId, clientId },
    include: { job: true, result: true }
  });

  if (!txn) {
    throw new AppError('transaction_not_found', 404);
  }

  return {
    trackingId: txn.trackingId,
    status: txn.status,
    createdAt: txn.createdAt,
    completedAt: txn.completedAt,
    result: txn.result
  };
};
