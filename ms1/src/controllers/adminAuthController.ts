import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { adminLoginSchema, adminRefreshSchema } from '../schemas/adminSchemas';
import { findAdminByEmail, findAdminById, updateLastLogin } from '../repositories/adminRepository';
import { issueAdminTokenPair, rotateAdminRefreshToken, revokeAdminSession } from '../services/adminJwtService';
import { AppError } from '../errors/AppError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = adminLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { email, password } = parseResult.data;

    const admin = await findAdminByEmail(email);
    if (!admin || !admin.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = await issueAdminTokenPair(admin.id, admin.role);
    await updateLastLogin(admin.id);

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = adminRefreshSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { refreshToken } = parseResult.data;
    const tokens = await rotateAdminRefreshToken(refreshToken);

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = adminRefreshSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { refreshToken } = parseResult.data;
    await revokeAdminSession(refreshToken);

    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.adminId) {
      throw new AppError('Unauthorized', 401);
    }

    const admin = await findAdminById(req.adminId);
    if (!admin) {
      throw new AppError('Not found', 404);
    }

    res.status(200).json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt
    });
  } catch (error) {
    next(error);
  }
};
