import app from './app';
import connectDB from './config/db';
import { config } from './config/env.config';

const startServer = async () => {
    await connectDB();

    app.listen(config.port, () => {
        console.log(`🚀 Server running in ${config.env} mode on http://localhost:${config.port}`);
        console.log(`📑 Docs available at http://localhost:${config.port}/api-docs`);
    });
};

startServer();