import { Request, Response, NextFunction } from 'express';
import { authAttempts } from '../config/metrics';
import * as clientService from '../services/clientService';
import { registerSchema, verifyEmailQuerySchema, loginSchema, refreshSchema, logoutSchema } from '../schemas/authSchemas';
import { AppError } from '../errors/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { orgName, email, password } = parseResult.data;
    
    await clientService.registerNewClient(orgName, email, password);

    res.status(201).json({ message: 'check_your_email' });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = verifyEmailQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }

    const { token } = parseResult.data;
    
    await clientService.verifyClientEmail(token);

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    const { email, password } = parseResult.data;
    const tokens = await clientService.authenticateClient(email, password);
    authAttempts.add(1, { result: 'success' });
    res.status(200).json(tokens);
  } catch (error) {
    authAttempts.add(1, { result: 'failure' });
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = refreshSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    const { refreshToken } = parseResult.data;
    
    const { rotateRefreshToken } = await import('../services/jwtService');
    const tokens = await rotateRefreshToken(refreshToken);
    
    res.status(200).json(tokens);
  } catch (error: any) {
    if (error && error.message === 'invalid_or_expired_token') {
      next(new AppError('invalid_or_expired_token', 401));
    } else {
      next(error);
    }
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = logoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    const { refreshToken } = parseResult.data;
    
    const { revokeSession } = await import('../services/jwtService');
    await revokeSession(refreshToken);
    
    res.status(200).json({ message: 'logged_out' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { forgotPasswordSchema } = await import('../schemas/authSchemas');
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    
    const { email } = parseResult.data;
    await clientService.requestPasswordReset(email);
    
    res.status(200).json({ message: 'If the email is registered, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetPasswordSchema } = await import('../schemas/authSchemas');
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(parseResult.error.issues.map((e: any) => e.message).join(', '), 400);
    }
    
    const { token, newPassword } = parseResult.data;
    await clientService.resetPassword(token, newPassword);
    
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};
