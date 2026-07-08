import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const adminRefreshSchema = z.object({
  refreshToken: z.string().min(1)
});
