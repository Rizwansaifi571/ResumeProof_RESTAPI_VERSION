import crypto from 'crypto';

export const generateTrackingId = (): string => {
  return `req_${crypto.randomBytes(16).toString('hex')}`;
};
