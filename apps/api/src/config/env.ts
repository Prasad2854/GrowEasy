import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8080'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  FRONTEND_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
