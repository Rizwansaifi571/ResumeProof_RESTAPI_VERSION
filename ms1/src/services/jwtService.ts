import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const issueTokenPair = async (clientId: string, email: string) => {
  const accessToken = jwt.sign(
    { clientId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL as string } as jwt.SignOptions
  );

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  // Convert "30d" to Date calculation
  const ttlDaysMatch = env.JWT_REFRESH_TTL.match(/^(\d+)d$/);
  const days = ttlDaysMatch ? parseInt(ttlDaysMatch[1], 10) : 30;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.session.create({
    data: {
      clientId,
      refreshTokenHash,
      expiresAt,
      isRevoked: false
    }
  });

  return { accessToken, refreshToken: rawRefreshToken };
};

export const verifyRefreshToken = async (rawRefreshToken: string) => {
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash },
    include: { client: true }
  });

  if (!session || session.isRevoked || new Date() > session.expiresAt) {
    return null;
  }

  return session;
};

export const rotateRefreshToken = async (oldRawRefreshToken: string) => {
  const session = await verifyRefreshToken(oldRawRefreshToken);
  if (!session) {
    throw new Error('invalid_or_expired_token');
  }

  await prisma.session.delete({
    where: { id: session.id }
  });

  return issueTokenPair(session.clientId, session.client.email);
};

export const revokeSession = async (rawRefreshToken: string) => {
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await prisma.session.deleteMany({
    where: { refreshTokenHash }
  });
};
