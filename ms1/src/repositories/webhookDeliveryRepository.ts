import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const createDeliveryRecord = async (transactionId: string, clientId: string, url: string, payload: any) => {
  return prisma.webhookDelivery.create({
    data: {
      transactionId,
      clientId,
      url,
      payload,
      attempt: 1
    }
  });
};

export const markDelivered = async (deliveryId: string, statusCode: number, responseBody: string) => {
  return prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      delivered: true,
      statusCode,
      responseBody,
      nextRetryAt: null
    }
  });
};

export const incrementAttempt = async (deliveryId: string, statusCode: number | null, responseBody: string | null, nextRetryAt: Date | null) => {
  return prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      attempt: { increment: 1 },
      statusCode,
      responseBody,
      nextRetryAt
    }
  });
};

export const getPendingRetries = async () => {
  return prisma.webhookDelivery.findMany({
    where: {
      delivered: false,
      nextRetryAt: { lte: new Date() }
    }
  });
};
