import dotenv from 'dotenv';
dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  DEMO_DATABASE_URL: required('DEMO_DATABASE_URL'),
  DEMO_PORT: parseInt(process.env.DEMO_PORT || '7005', 10),
  RESUMEPROOF_API_KEY: required('RESUMEPROOF_API_KEY'),
  RESUMEPROOF_API_URL: required('RESUMEPROOF_API_URL'),
  WEBHOOK_SECRET: required('WEBHOOK_SECRET'),
};
