import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(3),
  S3_PUBLIC_ENDPOINT: z.string().url(),
  S3_FORCE_PATH_STYLE: z.string().default('true'),
  PRESIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(604800).default(3600)
});

export const env = schema.parse(process.env);
