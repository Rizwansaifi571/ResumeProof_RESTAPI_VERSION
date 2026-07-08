import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const findClientByEmail = async (email: string) => {
  return prisma.client.findUnique({
    where: { email }
  });
};

export const createClient = async (data: { name: string; email: string; passwordHash: string }) => {
  return prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      plan: 'free',
      monthlyQuota: 500,
      isVerified: false
    }
  });
};

export const findClientById = async (id: string) => {
  return prisma.client.findUnique({
    where: { id }
  });
};

export const markEmailVerified = async (clientId: string) => {
  return prisma.client.update({
    where: { id: clientId },
    data: { isVerified: true }
  });
};

export const updateWebhookConfig = async (clientId: string, webhookUrl: string, webhookSecret: string) => {
  return prisma.client.update({
    where: { id: clientId },
    data: { webhookUrl, webhookSecret }
  });
};

export const createEmailVerification = async (data: { clientId: string; tokenHash: string; expiresAt: Date }) => {
  return prisma.emailVerification.create({
    data
  });
};

export const findEmailVerificationByHash = async (tokenHash: string) => {
  return prisma.emailVerification.findFirst({
    where: { tokenHash }
  });
};

export const deleteEmailVerification = async (id: string) => {
  return prisma.emailVerification.delete({
    where: { id }
  });
};
