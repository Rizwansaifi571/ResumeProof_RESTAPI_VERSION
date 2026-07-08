import { Request, Response, NextFunction } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { verificationCompleted, verificationDurationMs } from '../config/metrics';
import * as resultRepository from '../repositories/resultRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import * as webhookService from '../services/webhookService';

const tracer = trace.getTracer('ms1-gateway');

export const handleResult = async (req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan('internal.result_received');
  try {
    const { transactionId, clientId, resultData } = req.body as { transactionId: string; clientId: string; resultData: any };

    const result = await resultRepository.createResult({
      transactionId,
      confidenceScore: resultData?.confidenceScore,
      status: resultData?.status,
      githubUsername: resultData?.githubUsername,
      reposFound: resultData?.reposFound,
      claimedProjects: resultData?.claimedProjects,
      verifiedProjects: resultData?.verifiedProjects,
      commitAuthorship: resultData?.commitAuthorship,
      skillAlignment: resultData?.skillAlignment,
      matchedSkills: resultData?.matchedSkills,
      missingSkills: resultData?.missingSkills,
      flags: resultData?.flags,
      rawGithubData: resultData?.rawGithubData,
      aiAnalysis: resultData?.aiAnalysis
    });

    const transaction = await transactionRepository.updateTransactionComplete(transactionId);

    verificationCompleted.add(1, { 'result.status': result?.status ?? 'unknown' });
    if (transaction && transaction.createdAt) {
      const durationMs = Date.now() - new Date(transaction.createdAt).getTime();
      verificationDurationMs.record(durationMs, { 'result.status': result?.status ?? 'unknown' });
    }

    webhookService.dispatchWebhook(transactionId, clientId, {
      event: 'verification.completed',
      data: result
    }).catch(err => {
    });

    span.setAttributes({
      'result.tracking_id': req.body.trackingId || req.body.transactionId || '',
      'result.confidence_score': result?.confidenceScore ?? -1,
      'result.status': result?.status ?? 'unknown'
    });
    span.setStatus({ code: SpanStatusCode.OK });

    res.status(200).json({ success: true });
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    next(error);
  } finally {
    span.end();
  }
};
