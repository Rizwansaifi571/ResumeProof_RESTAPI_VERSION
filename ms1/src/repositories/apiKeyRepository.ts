import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const findActiveKeysByPrefix = async (prefix: string) => {
  return prisma.apiKey.findMany({
    where: { prefix, isActive: true },
    include: { client: true }
  });
};

export const createApiKey = async (clientId: string, keyHash: string, prefix: string, label: string) => {
  return prisma.apiKey.create({
    data: {
      clientId,
      keyHash,
      prefix,
      label,
      isActive: true
    }
  });
};

export const listKeysByClient = async (clientId: string) => {
  return prisma.apiKey.findMany({
    where: { clientId },
    select: {
      id: true,
      prefix: true,
      label: true,
      isActive: true,
      lastUsed: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const revokeKey = async (clientId: string, keyId: string) => {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, clientId }
  });

  if (!key) {
    return null;
  }

  return prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false }
  });
};

export const updateLastUsed = async (keyId: string) => {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: { lastUsed: new Date() }
  });
};
