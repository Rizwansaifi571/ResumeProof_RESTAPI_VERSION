import { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import * as applicationRepository from '../repositories/applicationRepository';

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-resumeproof-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(401).json({ error: 'Missing signature' });
      return;
    }

    // Compute HMAC
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      res.status(400).json({ error: 'Missing raw body' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Process Payload
    const payload = req.body;
    
    // In ResumeProof MS1, the webhook payload contains:
    // { event: 'verification_completed', transactionId: '...', result: { ... } }
    if (payload.event === 'verification_completed' && payload.transactionId) {
      const status = payload.result.status === 'verified' ? 'verified' : 'rejected';
      await applicationRepository.updateApplicationResultByTransactionId(
        payload.transactionId,
        status,
        payload.result
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
