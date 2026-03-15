import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env.config';
import { corsOptions } from './config/cors';
import { specs } from './config/swagger';
import './config/i18n';
import rootRouter from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware.handle(i18next));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: req.t('welcome_message'),
        environment: config.env
    });
});

// API Routes
app.use('/api/v1', rootRouter);
app.use(globalErrorHandler);

export default app;