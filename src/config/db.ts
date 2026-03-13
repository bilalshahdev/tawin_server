// /src/config/db

import mongoose from 'mongoose';
import { config } from './env.config';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB error: ${err}`);
        });

    } catch (error) {
        console.error(`❌ DB Connection Error: ${error}`);
        process.exit(1);
    }
};

export default connectDB;