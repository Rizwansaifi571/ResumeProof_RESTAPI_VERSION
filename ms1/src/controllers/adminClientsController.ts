import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getPrismaClient } from '../config/prismaClient';
import { AppError } from '../errors/AppError';

const prisma = getPrismaClient();

const updatePlanSchema = z.object({
  plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
  monthlyQuota: z.number().int().min(1)
});

export const listClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let page = parseInt(req.query.page as string, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    let limit = parseInt(req.query.limit as string, 10);
    if (isNaN(limit) || limit < 1) {
      limit = 25;
    }
    if (limit > 100) {
      limit = 100;
    }

    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const plan = req.query.plan ? String(req.query.plan).trim() : undefined;
    const verifiedParam = req.query.verified ? String(req.query.verified).trim() : undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (plan) {
      where.plan = plan;
    }

    if (verifiedParam !== undefined) {
      where.isVerified = verifiedParam === 'true';
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          isVerified: true,
          monthlyQuota: true,
          webhookUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              apiKeys: { where: { isActive: true } },
              transactions: true
            }
          }
        }
      }),
      prisma.client.count({ where })
    ]);

    res.status(200).json({
      clients,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = String(req.params.clientId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [client, transactionsThisMonth] = await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        include: {
          apiKeys: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { transactions: true }
          }
        }
      }),
      prisma.transaction.count({
        where: {
          clientId,
          createdAt: { gte: startOfMonth }
        }
      })
    ]);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const sanitizedApiKeys = client.apiKeys.map(({ keyHash, ...rest }) => rest);
    const { apiKeys, _count, ...clientData } = client;

    res.status(200).json({
      ...clientData,
      apiKeys: sanitizedApiKeys,
      transactionsTotal: _count.transactions,
      transactionsThisMonth
    });
  } catch (error) {
    next(error);
  }
};

export const updateClientPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.adminRole !== 'superadmin') {
      throw new AppError('Forbidden', 403);
    }

    const parseResult = updatePlanSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { plan, monthlyQuota } = parseResult.data;
    const clientId = String(req.params.clientId);

    const existingClient = await prisma.client.findUnique({ where: { id: clientId } });
    if (!existingClient) {
      throw new AppError('Client not found', 404);
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { plan, monthlyQuota },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        monthlyQuota: true
      }
    });

    await prisma.auditLog.create({
      data: {
        clientId,
        event: 'admin.client.plan_updated',
        metadata: {
          clientId,
          plan,
          monthlyQuota,
          adminId: req.adminId as string
        }
      }
    });

    res.status(200).json(updatedClient);
  } catch (error) {
    next(error);
  }
};
