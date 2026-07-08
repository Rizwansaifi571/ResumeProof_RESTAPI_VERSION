import axios from 'axios';
import crypto from 'crypto';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { webhookDispatched, webhookDelivered, webhookLatencyMs } from '../config/metrics';
import * as clientRepository from '../repositories/clientRepository';
import * as webhookDeliveryRepository from '../repositories/webhookDeliveryRepository';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

const tracer = trace.getTracer('ms1-gateway');

export const sendWebhookTestPing = async (webhookUrl: string, webhookSecret: string) => {
  const payload = {
    event: 'test.ping',
    timestamp: new Date().toISOString(),
    data: { message: 'Hello from ResumeProof API!' }
  };
  
  const payloadString = JSON.stringify(payload);
  
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('hex');

  try {
    const response = await axios.post(webhookUrl, payloadString, {
      headers: {
        'Content-Type': 'application/json',
        'x-rp-signature': signature
      },
      timeout: 10000 // 10s timeout
    });
    
    if (response.status >= 400) {
      throw new AppError('webhook_endpoint_unreachable', 400);
    }
  } catch (error) {
    logger.error('Webhook ping failed:', error);
    throw new AppError('webhook_endpoint_unreachable', 400);
  }
};

const handleWebhookFailure = async (delivery: any, statusCode: number | null, responseBody: string | null) => {
  const maxAttempts = 5;
  if (delivery.attempt >= maxAttempts) {
    await webhookDeliveryRepository.incrementAttempt(delivery.id, statusCode, responseBody, null);
    return;
  }

  const delayMinutes = Math.pow(2, delivery.attempt) * 5;
  const nextRetryAt = new Date(Date.now() + delayMinutes * 60000);

  await webhookDeliveryRepository.incrementAttempt(delivery.id, statusCode, responseBody, nextRetryAt);
};

export const dispatchWebhook = async (transactionId: string, clientId: string, payload: any) => {
  const client = await clientRepository.findClientById(clientId);
  if (!client || !client.webhookUrl || !client.webhookSecret) {
    logger.warn(`No webhook configured for client ${clientId}`);
    return;
  }

  const { webhookUrl, webhookSecret } = client;

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadString)
    .digest('hex');

  const delivery = await webhookDeliveryRepository.createDeliveryRecord(transactionId, clientId, webhookUrl, payload);

  let webhookHost = webhookUrl;
  try {
    const parsedUrl = new URL(webhookUrl);
    webhookHost = parsedUrl.host;
  } catch (e) {
    // fallback if URL parsing fails
  }

  let delivered = false;
  const span = tracer.startSpan('webhook.dispatch');
  span.setAttributes({
    'webhook.client_id': clientId,
    'webhook.url': webhookHost,
    'webhook.attempt': delivery.attempt || 1
  });

  webhookDispatched.add(1);
  const start = Date.now();

  try {
    const response = await axios.post(webhookUrl, payloadString, {
      headers: {
        'Content-Type': 'application/json',
        'x-rp-signature': signature
      },
      timeout: 10000
    });

    if (response.status >= 200 && response.status < 300) {
      delivered = true;
      webhookDelivered.add(1);
      webhookLatencyMs.record(Date.now() - start);
      await webhookDeliveryRepository.markDelivered(delivery.id, response.status, JSON.stringify(response.data).substring(0, 500));
    } else {
      await handleWebhookFailure(delivery, response.status, JSON.stringify(response.data).substring(0, 500));
    }
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error: unknown) {
    const err = error as any;
    logger.error('Webhook dispatch failed:', err.message);
    const statusCode = err.response?.status || null;
    const responseBody = err.response?.data ? JSON.stringify(err.response.data).substring(0, 500) : err.message;
    await handleWebhookFailure(delivery, statusCode, responseBody);

    span.recordException(err as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });
  } finally {
    span.setAttribute('webhook.delivered', delivered);
    span.end();
  }
};
