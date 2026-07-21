import { z } from 'zod';

export const applySchema = z.object({
  jobId: z.string().uuid(),
  candidateName: z.string().min(1),
  candidateEmail: z.string().email(),
  githubUrl: z.string().url()
});
