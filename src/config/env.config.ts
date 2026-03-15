import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    CORS_ORIGIN: z.string().default('*'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}
export const config = {
    env,
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    jwtSecret: process.env.JWT_SECRET || 'your_secret',
    emailService: process.env.EMAIL_SERVICE || 'false',
    mailUsername: process.env.MAIL_USERNAME || '',
    mailPassword: process.env.MAIL_PASSWORD || '',
    mailFromAddress: process.env.MAIL_FROM_ADDRESS || '',
};

