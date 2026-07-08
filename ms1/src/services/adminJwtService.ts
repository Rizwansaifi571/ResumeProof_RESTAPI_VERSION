import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import {
  createAdminSession,
  findAdminSession,
  revokeAdminSession as repoRevokeAdminSession
} from '../repositories/adminRepository';

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const issueAdminTokenPair = async (
  adminId: string,
  role: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const secret = env.JWT_SECRET;

  const accessToken = jwt.sign(
    { sub: adminId, role, type: 'admin' },
    secret,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await createAdminSession({
    adminId,
    refreshTokenHash,
    expiresAt
  });

  return {
    accessToken,
    refreshToken
  };
};

export const verifyAdminRefreshToken = async (
  rawToken: string
): Promise<{ adminId: string; role: string }> => {
  const refreshTokenHash = hashToken(rawToken);
  const session = await findAdminSession(refreshTokenHash);

  if (!session || !session.admin) {
    throw new AppError('Invalid refresh token', 401);
  }

  return {
    adminId: session.admin.id,
    role: session.admin.role
  };
};

export const revokeAdminSession = async (rawToken: string): Promise<void> => {
  const refreshTokenHash = hashToken(rawToken);
  const session = await findAdminSession(refreshTokenHash);
  if (session) {
    await repoRevokeAdminSession(session.id);
  }
};

export const rotateAdminRefreshToken = async (
  oldRawToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { adminId, role } = await verifyAdminRefreshToken(oldRawToken);
  await revokeAdminSession(oldRawToken);
  return issueAdminTokenPair(adminId, role);
};
