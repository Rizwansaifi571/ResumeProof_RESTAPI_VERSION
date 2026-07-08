import { Request, Response, NextFunction } from 'express';
import { writeLatencySnapshot } from '../config/metrics';

let lastSnapshotAt = 0;
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

// In-memory ring buffer for the current 5-minute window
const recentLatencies: number[] = [];

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

export const responseTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    recentLatencies.push(duration);
    // Keep ring buffer bounded
    if (recentLatencies.length > 1000) recentLatencies.shift();

    const now = Date.now();
    if (now - lastSnapshotAt >= SNAPSHOT_INTERVAL_MS && recentLatencies.length >= 5) {
      lastSnapshotAt = now;
      const p50 = percentile(recentLatencies, 50);
      const p95 = percentile(recentLatencies, 95);
      const p99 = percentile(recentLatencies, 99);
      recentLatencies.length = 0; // reset for next window
      writeLatencySnapshot(p50, p95, p99).catch(() => {}); // fire-and-forget
    }
  });
  next();
};
