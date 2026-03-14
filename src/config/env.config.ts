import dotenv from 'dotenv';
import path from 'path';
import { AUTH_CONSTANTS, MAIL_CONSTANTS } from './constants';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY } = AUTH_CONSTANTS;
const { MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_ENCRYPTION, MAIL_FROM_ADDRESS } = MAIL_CONSTANTS;

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

