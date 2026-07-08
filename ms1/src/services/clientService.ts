import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as clientRepository from '../repositories/clientRepository';
import * as emailService from './emailService';
import * as jwtService from './jwtService';
import * as webhookService from './webhookService';
import { AppError } from '../errors/AppError';
import { getPrismaClient } from '../config/prismaClient';

const prisma = getPrismaClient();

export const registerNewClient = async (orgName: string, email: string, passwordPlain: string) => {
  const existingClient = await clientRepository.findClientByEmail(email);
  if (existingClient) {
    throw new AppError('email_in_use', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);

  const client = await clientRepository.createClient({ name: orgName, email, passwordHash });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.create({
    data: {
      clientId: client.id,
      tokenHash,
      expiresAt
    }
  });

  await emailService.sendEmailVerificationLink(email, rawToken);

  return client;
};

export const verifyClientEmail = async (rawToken: string) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const verification = await prisma.emailVerification.findFirst({
    where: { tokenHash }
  });

  if (!verification) {
    throw new AppError('invalid_token', 400);
  }

  if (verification.expiresAt < new Date()) {
    throw new AppError('token_expired', 400);
  }

  await clientRepository.markEmailVerified(verification.clientId);
  await prisma.emailVerification.delete({ where: { id: verification.id } });

  return { success: true };
};

export const authenticateClient = async (email: string, passwordPlain: string) => {
  const client = await clientRepository.findClientByEmail(email);
  if (!client) {
    throw new AppError('invalid_credentials', 401);
  }

  if (!client.isVerified) {
    throw new AppError('email_not_verified', 403);
  }

  const isMatch = await bcrypt.compare(passwordPlain, client.passwordHash);
  if (!isMatch) {
    throw new AppError('invalid_credentials', 401);
  }

  const tokens = await jwtService.issueTokenPair(client.id, client.email);
  return tokens;
};

export const setWebhookConfig = async (clientId: string, webhookUrl: string) => {
  const webhookSecret = crypto.randomBytes(32).toString('hex');
  
  await webhookService.sendWebhookTestPing(webhookUrl, webhookSecret);
  
  await clientRepository.updateWebhookConfig(clientId, webhookUrl, webhookSecret);
  
  return { webhookSecret };
};

export const requestPasswordReset = async (email: string) => {
  const client = await clientRepository.findClientByEmail(email);
  if (!client) {
    // We don't want to leak whether an email is registered or not, so we just return success
    // However, since this is a private dashboard, returning error is also fine. We will just return to prevent errors.
    return { success: true };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      clientId: client.id,
      tokenHash,
      expiresAt
    }
  });

  await emailService.sendPasswordResetEmail(email, rawToken);

  return { success: true };
};

export const resetPassword = async (rawToken: string, newPasswordPlain: string) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const resetRequest = await prisma.passwordReset.findFirst({
    where: { tokenHash }
  });

  if (!resetRequest) {
    throw new AppError('invalid_token', 400);
  }

  if (resetRequest.expiresAt < new Date()) {
    throw new AppError('token_expired', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPasswordPlain, salt);

  await prisma.client.update({
    where: { id: resetRequest.clientId },
    data: { passwordHash }
  });

  await prisma.passwordReset.delete({ where: { id: resetRequest.id } });

  return { success: true };
};

export const getProfile = async (clientId: string) => {
  const client = await clientRepository.findClientById(clientId);
  if (!client) {
    throw new AppError('client_not_found', 404);
  }
  
  return {
    name: client.name,
    email: client.email,
    plan: client.plan,
    monthlyQuota: client.monthlyQuota,
    isVerified: client.isVerified,
    webhookUrl: client.webhookUrl
  };
};
