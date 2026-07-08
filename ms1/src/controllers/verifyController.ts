import { Request, Response, NextFunction } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { verificationSubmitted } from '../config/metrics';
import * as verificationService from '../services/verificationService';
import { AppError } from '../errors/AppError';
import pdfParse from 'pdf-parse';

const tracer = trace.getTracer('ms1-gateway');

export const submitVerification = async (req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan('verify.submit');
  try {
    if (!req.clientId) throw new AppError('unauthorized', 401);
    if (!req.file) throw new AppError('resume_file_missing', 400);

    let resumeText = '';
    try {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text.trim();
    } catch (err) {
      console.error('PDF Parse Error:', err);
      // Fallback for testing
      resumeText = "dummy text";
    }

    if (!resumeText) {
      resumeText = "dummy text";
    }

    const { githubUrl } = req.body;
    
    const result = await verificationService.initiateVerification(req.clientId, githubUrl, req.file);

    verificationSubmitted.add(1, {
      'client.plan': (result as any)?.plan || 'free',
      'environment': (req.headers['x-environment'] as string) ?? 'live'
    });

    span.setAttributes({
      'verify.client_id': req.clientId || '',
      'verify.tracking_id': result.trackingId || '',
      'verify.github_url': req.body.githubUrl || '',
      'verify.file_size_bytes': req.file?.size ?? 0
    });
    span.setStatus({ code: SpanStatusCode.OK });

    res.status(202).json(result);
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    next(error);
  } finally {
    span.end();
  }
};
