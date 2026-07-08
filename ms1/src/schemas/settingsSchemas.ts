import { z } from 'zod';

export const webhookSchema = z.object({
  webhookUrl: z.string().url('Must be a valid URL').refine((url) => {
    if (process.env.NODE_ENV !== 'production' && url.startsWith('http://localhost')) {
      return true;
    }
    return url.startsWith('https://');
  }, { message: 'Webhook URL must be HTTPS' })
});
