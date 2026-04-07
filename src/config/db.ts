import mongoose from 'mongoose';
import { config } from './env.config';
import { logger } from './logger'; // Use your new logger
import i18next from 'i18next';      // Direct import for system logs

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        logger.info(`${i18next.t('database.connected')}: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`${i18next.t('database.error')}: ${err}`);
        });

    } catch (error) {
        logger.error(`${i18next.t('database.connection_failed')}: ${error}`);
        process.exit(1);
    }
};

export default connectDB;