import * as dotenv from 'dotenv';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

// ─── Header parser ───────────────────────────────────────────────────────────
// Parses "Authorization=Basic abc123==,X-Other=value" into a header object.
// IMPORTANT: splits on the FIRST = only (indexOf, not split('=')) so that
// base64 padding characters at the end of the value are preserved correctly.
function parseOtelHeaders(raw: string): Record<string, string> {
  if (!raw || !raw.trim()) return {};
  const result: Record<string, string> = {};
  for (const pair of raw.split(',')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

// ─── SDK initializer ─────────────────────────────────────────────────────────
export function initTelemetry(): void {
  dotenv.config();
  const isEnabled = process.env.OTEL_ENABLED === 'true';

  if (!isEnabled) {
    console.log('[OTel] Disabled. Set OTEL_ENABLED=true to enable.');
    return;
  }

  // The full OTLP endpoint — e.g.
  // https://otlp-gateway-prod-ap-south-1.grafana.net/otlp
  const endpoint = (
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'
  ).replace(/\/$/, ''); // strip trailing slash if present

  // Parse auth headers from env.
  // Grafana provides this as:
  //   Authorization=Basic MTczMjI5OTpnbGNf...
  const headers = parseOtelHeaders(
    process.env.OTEL_EXPORTER_OTLP_HEADERS ?? ''
  );

  // ── Trace exporter ──────────────────────────────────────────────────────
  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
    headers,
  });

  // ── Metric exporter ─────────────────────────────────────────────────────
  const metricExporter = new OTLPMetricExporter({
    url: `${endpoint}/v1/metrics`,
    headers,
  });

  // ── SDK ─────────────────────────────────────────────────────────────────
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: 'ms1-gateway',
      [SEMRESATTRS_SERVICE_VERSION]:
        process.env.npm_package_version ?? '1.0.0',
    }),
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 30_000, // push metrics every 30s
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // fs and dns are too noisy and add no value for this service
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();

  // Startup confirmation — visible in pm2 logs
  console.log('[OTel] SDK started.');
  console.log('[OTel] Endpoint:', endpoint);
  console.log('[OTel] Auth header present:', !!headers['Authorization']);
  console.log('[OTel] Service name: ms1-gateway');

  // Graceful shutdown — flushes any buffered spans before the process exits
  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown();
      console.log('[OTel] SDK shut down cleanly.');
    } catch (err) {
      console.error('[OTel] Error during shutdown:', err);
    }
  });
}
