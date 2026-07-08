import { z } from 'zod';

export const generateKeySchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label too long'),
  environment: z.enum(['live', 'test']).default('live')
});
