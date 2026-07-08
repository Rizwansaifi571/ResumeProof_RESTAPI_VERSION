import crypto from 'crypto';
import bcrypt from 'bcrypt';
import * as apiKeyRepository from '../repositories/apiKeyRepository';
import { AppError } from '../errors/AppError';

export const generateApiKey = async (clientId: string, label: string, environment: string) => {
  const prefix = environment === 'live' ? 'rp_live_' : 'rp_test_';
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const rawKey = prefix + randomPart;
  
  const keyHash = await bcrypt.hash(rawKey, 10);
  
  const newKey = await apiKeyRepository.createApiKey(clientId, keyHash, prefix, label);
  
  return {
    apiKey: rawKey,
    prefix,
    label: newKey.label,
    createdAt: newKey.createdAt,
    warning: "Store this key securely. It will not be shown again."
  };
};

export const listClientKeys = async (clientId: string) => {
  return apiKeyRepository.listKeysByClient(clientId);
};

export const revokeKey = async (clientId: string, keyId: string) => {
  const revoked = await apiKeyRepository.revokeKey(clientId, keyId);
  if (!revoked) {
    throw new AppError('key_not_found', 404);
  }
  return { revoked: true };
};
