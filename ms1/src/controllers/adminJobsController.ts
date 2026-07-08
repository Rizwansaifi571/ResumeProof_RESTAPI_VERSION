import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../config/prismaClient';
import * as webhookService from '../services/webhookService';
import { AppError } from '../errors/AppError';

const prisma = getPrismaClient();

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let page = parseInt(req.query.page as string, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    let limit = parseInt(req.query.limit as string, 10);
    if (isNaN(limit) || limit < 1) {
      limit = 50;
    }
    if (limit > 200) {
      limit = 200;
    }

    const clientId = req.query.clientId ? String(req.query.clientId).trim() : undefined;
    const status = req.query.status ? String(req.query.status).trim() : undefined;
    const from = req.query.from ? String(req.query.from).trim() : undefined;
    const to = req.query.to ? String(req.query.to).trim() : undefined;
    const githubUsername = req.query.githubUsername ? String(req.query.githubUsername).trim() : undefined;

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    if (githubUsername) {
      where.githubUrl = { contains: githubUsername, mode: 'insensitive' };
    }

    const [rawJobs, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          job: {
            select: { status: true, attempts: true, errorMessage: true, startedAt: true, finishedAt: true }
          },
          result: {
            select: {
              confidenceScore: true,
              status: true,
              githubUsername: true,
              flags: true,
              matchedSkills: true,
              missingSkills: true,
              verifiedProjects: true,
              skillAlignment: true
            }
          },
          webhookDeliveries: {
            orderBy: { createdAt: 'asc' },
            select: { id: true, delivered: true, statusCode: true, attempt: true, createdAt: true, nextRetryAt: true }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const jobs = rawJobs.map((t) => {
      let processingTimeSec: number | null = null;
      if (t.completedAt && t.createdAt) {
        processingTimeSec = (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 1000;
      }
      return {
        ...t,
        processingTimeSec
      };
    });

    res.status(200).json({
      jobs,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = String(req.params.trackingId);

    const transaction = await prisma.transaction.findUnique({
      where: { trackingId },
      include: {
        client: {
          select: { id: true, name: true, email: true, plan: true, webhookUrl: true }
        },
        job: true,
        result: true,
        webhookDeliveries: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!transaction) {
      throw new AppError('Job not found', 404);
    }

    let processingTimeSec: number | null = null;
    if (transaction.completedAt && transaction.createdAt) {
      processingTimeSec = (new Date(transaction.completedAt).getTime() - new Date(transaction.createdAt).getTime()) / 1000;
    }

    res.status(200).json({
      ...transaction,
      processingTimeSec
    });
  } catch (error) {
    next(error);
  }
};

export const retryWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = String(req.params.trackingId);

    const transaction = await prisma.transaction.findUnique({
      where: { trackingId },
      include: {
        client: true,
        result: true,
        webhookDeliveries: true
      }
    });

    if (!transaction) {
      throw new AppError('Job not found', 404);
    }

    if (transaction.status !== 'done') {
      throw new AppError('Job not complete', 400);
    }

    if (!transaction.client || !transaction.client.webhookUrl) {
      throw new AppError('No webhook configured', 400);
    }

    const payload = {
      event: 'verification.completed',
      data: transaction.result || {}
    };

    webhookService.dispatchWebhook(transaction.id, transaction.clientId, payload).catch((err) => {
      // Async error swallowed/logged inside webhookService
    });

    await prisma.auditLog.create({
      data: {
        clientId: transaction.clientId,
        event: 'admin.webhook.retried',
        metadata: {
          trackingId,
          adminId: String(req.adminId)
        }
      }
    });

    res.status(200).json({
      message: 'Webhook retry dispatched',
      trackingId
    });
  } catch (error) {
    next(error);
  }
};

export const exportJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.query.clientId ? String(req.query.clientId).trim() : undefined;
    const status = req.query.status ? String(req.query.status).trim() : undefined;
    const from = req.query.from ? String(req.query.from).trim() : undefined;
    const to = req.query.to ? String(req.query.to).trim() : undefined;
    const githubUsername = req.query.githubUsername ? String(req.query.githubUsername).trim() : undefined;

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    if (githubUsername) {
      where.githubUrl = { contains: githubUsername, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: 10000,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { email: true } },
        result: { select: { confidenceScore: true, verifiedProjects: true, flags: true } },
        webhookDeliveries: { select: { delivered: true } }
      }
    });

    const columns = [
      'trackingId',
      'clientEmail',
      'githubUrl',
      'status',
      'confidenceScore',
      'verifiedProjects',
      'flags',
      'processingTimeSec',
      'webhookDelivered',
      'createdAt',
      'completedAt'
    ];

    const header = columns.join(',');

    const rows = transactions.map((t) => {
      let processingTimeSec: string | number = '';
      if (t.completedAt && t.createdAt) {
        processingTimeSec = (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 1000;
      }

      const webhookDelivered = t.webhookDeliveries.some((w) => w.delivered) ? 'true' : 'false';

      const rowData: Record<string, any> = {
        trackingId: t.trackingId,
        clientEmail: t.client?.email || '',
        githubUrl: t.githubUrl,
        status: t.status,
        confidenceScore: t.result?.confidenceScore ?? '',
        verifiedProjects: t.result?.verifiedProjects ?? '',
        flags: t.result?.flags ? JSON.stringify(t.result.flags) : '',
        processingTimeSec,
        webhookDelivered,
        createdAt: t.createdAt ? t.createdAt.toISOString() : '',
        completedAt: t.completedAt ? t.completedAt.toISOString() : ''
      };

      return columns.map((col) => JSON.stringify(rowData[col] ?? '')).join(',');
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs-export.csv"');
    res.status(200).send([header, ...rows].join('\n'));
  } catch (error) {
    next(error);
  }
};
