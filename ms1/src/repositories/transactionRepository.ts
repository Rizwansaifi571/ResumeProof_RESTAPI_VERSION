import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const updateTransactionComplete = async (id: string) => {
  return prisma.transaction.update({
    where: { id },
    data: {
      status: 'done',
      completedAt: new Date()
    }
  });
};
