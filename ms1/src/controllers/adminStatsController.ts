import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../config/prismaClient';
import * as queueService from '../services/queueService';

const prisma = getPrismaClient();

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClients,
      activeThisMonth,
      totalJobsAllTime,
      jobsThisMonth,
      completedThisMonth,
      failedThisMonth,
      webhookFailures,
      avgResult
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: {
          transactions: {
            some: { createdAt: { gte: startOfMonth } }
          }
        }
      }),
      prisma.transaction.count(),
      prisma.transaction.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.transaction.count({
        where: { status: 'done', createdAt: { gte: startOfMonth } }
      }),
      prisma.transaction.count({
        where: { status: 'failed', createdAt: { gte: startOfMonth } }
      }),
      prisma.webhookDelivery.count({
        where: { delivered: false, createdAt: { gte: startOfMonth } }
      }),
      prisma.$queryRaw<Array<{ avg_sec: number | null }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))) as avg_sec
        FROM transactions
        WHERE status = 'done' AND "completedAt" IS NOT NULL
          AND "createdAt" >= ${startOfMonth}
      `
    ]);

    const avgProcessingTime = avgResult[0]?.avg_sec ? Number(avgResult[0].avg_sec) : 0;
    const totalCompletedAndFailed = completedThisMonth + failedThisMonth;
    const successRate = totalCompletedAndFailed > 0 ? completedThisMonth / totalCompletedAndFailed : 1;
    const webhookFailureRate = jobsThisMonth > 0 ? webhookFailures / jobsThisMonth : 0;

    res.status(200).json({
      totalClients,
      activeThisMonth,
      totalJobsAllTime,
      jobsThisMonth,
      completedThisMonth,
      failedThisMonth,
      webhookFailures,
      avgProcessingTime,
      successRate,
      webhookFailureRate
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let days = parseInt(req.query.days as string, 10);
    if (isNaN(days) || days <= 0) {
      days = 30;
    }
    if (days > 90) {
      days = 90;
    }

    const result = await prisma.$queryRaw<Array<{ date: Date | string; count: bigint | number }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM transactions
      WHERE "createdAt" >= NOW() - (${days} || ' days')::INTERVAL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const formattedResult = result.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
      count: Number(row.count)
    }));

    res.status(200).json(formattedResult);
  } catch (error) {
    next(error);
  }
};

export const getPlanDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.$queryRaw<Array<{ plan: string; count: bigint | number }>>`
      SELECT plan, COUNT(*)::int as count
      FROM clients
      GROUP BY plan
    `;

    const formattedResult = result.map((row) => ({
      plan: row.plan,
      count: Number(row.count)
    }));

    res.status(200).json(formattedResult);
  } catch (error) {
    next(error);
  }
};

export const getQueueStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await queueService.getQueueStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
