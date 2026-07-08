import { getPrismaClient } from '../config/prismaClient';
import { Admin, AdminSession, Prisma } from '@prisma/client';

const prisma = getPrismaClient();

export type AdminSessionWithAdmin = Prisma.AdminSessionGetPayload<{
  include: { admin: true };
}>;

export const findAdminByEmail = async (email: string): Promise<Admin | null> => {
  return prisma.admin.findUnique({
    where: { email }
  });
};

export const findAdminById = async (id: string): Promise<Admin | null> => {
  return prisma.admin.findUnique({
    where: { id }
  });
};

export const updateLastLogin = async (id: string): Promise<void> => {
  await prisma.admin.update({
    where: { id },
    data: { lastLoginAt: new Date() }
  });
};

export const createAdminSession = async (data: {
  adminId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}): Promise<AdminSession> => {
  return prisma.adminSession.create({
    data
  });
};

export const findAdminSession = async (
  refreshTokenHash: string
): Promise<AdminSessionWithAdmin | null> => {
  return prisma.adminSession.findFirst({
    where: {
      refreshTokenHash,
      isRevoked: false,
      expiresAt: { gt: new Date() }
    },
    include: {
      admin: true
    }
  });
};

export const revokeAdminSession = async (id: string): Promise<void> => {
  await prisma.adminSession.update({
    where: { id },
    data: { isRevoked: true }
  });
};

export const deleteAdminSession = async (id: string): Promise<void> => {
  await prisma.adminSession.delete({
    where: { id }
  });
};
