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
    LOW_STOCK_THRESHOLD: z.string().default('10'),
    ADMIN_PASSWORD: z.string().default('admin'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    SMS_SERVICE: z.string().default('false'),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM_NUMBER: z.string().optional(),
    BASKET_CARD_ENCRYPTION_KEY: z.string().optional(),
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
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // corsOrigin: process.env.CORS_ORIGIN || '*',
    corsOrigin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002"
    ],
    jwtSecret: process.env.JWT_SECRET || 'your_secret',
    emailService: process.env.EMAIL_SERVICE || 'false',
    mailUsername: process.env.MAIL_USERNAME || '',
    mailPassword: process.env.MAIL_PASSWORD || '',
    mailFromAddress: process.env.MAIL_FROM_ADDRESS || '',
    lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 10,
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
    smsService: process.env.SMS_SERVICE || 'false',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
    cardEncryptionKey: process.env.BASKET_CARD_ENCRYPTION_KEY || '',
};

