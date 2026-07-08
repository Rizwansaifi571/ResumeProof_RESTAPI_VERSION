import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      clientId?: string;
      adminId?: string;
      adminRole?: string;
    }
  }
}
