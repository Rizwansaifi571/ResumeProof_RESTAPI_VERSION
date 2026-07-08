import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const createResult = async (data: any) => {
  return prisma.result.upsert({
    where: { transactionId: data.transactionId },
    update: data,
    create: data
  });
};
