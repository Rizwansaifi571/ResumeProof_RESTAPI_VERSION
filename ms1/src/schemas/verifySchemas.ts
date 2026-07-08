import { z } from 'zod';

export const verifyRequestSchema = z.object({
  githubUrl: z.string().url('Must be a valid GitHub URL')
});
