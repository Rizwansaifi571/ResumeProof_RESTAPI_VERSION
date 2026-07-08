import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('ms1-gateway');

// Counters (ever-increasing)
export const verificationSubmitted = meter.createCounter('ms1.verify.submitted', {
  description: 'Total verification requests submitted',
});

export const verificationCompleted = meter.createCounter('ms1.verify.completed', {
  description: 'Total verifications completed (done or failed)',
});

export const webhookDispatched = meter.createCounter('ms1.webhook.dispatched', {
  description: 'Total webhook dispatch attempts',
});

export const webhookDelivered = meter.createCounter('ms1.webhook.delivered', {
  description: 'Total successful webhook deliveries',
});

export const authAttempts = meter.createCounter('ms1.auth.attempts', {
  description: 'Login attempts by result',
  // Use attributes: { result: 'success' | 'failure' }
});

// Histograms (distribution of values)
export const verificationDurationMs = meter.createHistogram(
  'ms1.verify.duration_ms', {
  description: 'End-to-end verification processing time in ms',
  unit: 'ms',
  advice: { explicitBucketBoundaries: [1000, 5000, 15000, 30000, 60000, 120000, 300000] }
});

export const webhookLatencyMs = meter.createHistogram(
  'ms1.webhook.latency_ms', {
  description: 'Time taken to deliver a webhook payload in ms',
  unit: 'ms',
});

import { redis } from './redisClient';

const LATENCY_KEY_PREFIX = 'otel:latency:snapshot:';
const MAX_SNAPSHOTS = 288; // 24h at 5-min intervals

export interface LatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

export async function writeLatencySnapshot(p50: number, p95: number, p99: number) {
  const key = `${LATENCY_KEY_PREFIX}${Date.now()}`;
  await redis.set(key, JSON.stringify({ time: new Date().toISOString(), p50, p95, p99 }), 'EX', 604800); // 7d TTL

  // Prune old keys if over limit (fire-and-forget)
  redis.keys(`${LATENCY_KEY_PREFIX}*`).then(async (keys) => {
    if (keys.length > MAX_SNAPSHOTS) {
      const sorted = keys.sort();
      const toDelete = sorted.slice(0, keys.length - MAX_SNAPSHOTS);
      if (toDelete.length > 0) {
        await redis.del(...toDelete);
      }
    }
  }).catch(() => {}); // non-critical
}

export async function readLatencySnapshots(windowMs: number): Promise<LatencyPoint[]> {
  const since = Date.now() - windowMs;
  const keys = await redis.keys(`${LATENCY_KEY_PREFIX}*`);
  const relevant = keys.filter(k => {
    const ts = parseInt(k.replace(LATENCY_KEY_PREFIX, ''), 10);
    return ts >= since;
  }).sort();

  if (relevant.length === 0) return [];
  const values = await redis.mget(relevant);
  return values
    .filter((v): v is string => Boolean(v))
    .map(v => JSON.parse(v) as LatencyPoint);
}
