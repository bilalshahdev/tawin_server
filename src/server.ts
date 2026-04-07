import app from './app';
import connectDB from './config/db';
import { config } from './config/env.config';
import { logger } from './config/logger';

const startServer = async () => {
    try {
        await connectDB();

        app.listen(config.port, () => {
            logger.info(`🚀 Server running in ${config.env} mode on http://localhost:${config.port}`);
            logger.info(`📑 Docs available at http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();