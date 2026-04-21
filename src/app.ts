import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import bcrypt from 'bcryptjs';

import { config } from './config/env.config';
import { corsOptions } from './config/cors';
import { specs } from './config/swagger';
import './config/i18n';
import rootRouter from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { requestContext } from './utils/context';
import { now } from 'lodash';
import { User } from './modules/user/user.model';

const app: Application = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 1. Add 'unsafe-inline' and the CDN for scripts
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        // 2. Add 'unsafe-inline' for styles (Swagger UI needs this)
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        connectSrc: ["'self'", "http://104.128.190.131:3520", "http://192.168.18.43:3520", "http://localhost:3520"],
        // 3. CRITICAL: Disable the automatic HTTPS upgrade
        upgradeInsecureRequests: null,
      },
    },
  })
);
// app.use(cors(corsOptions));
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(middleware.handle(i18next));
app.use((req, res, next) => {
  const store = new Map();
  // Capture the language i18next detected
  store.set('lang', req.language || 'en');

  requestContext.run(store, () => {
    next();
  });
});
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: req.t('health.check'),
    environment: config.env
  });
});

// API Routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(apiRateLimiter);
app.use('/api', rootRouter);

// Error handler
app.use(globalErrorHandler)

export default app;