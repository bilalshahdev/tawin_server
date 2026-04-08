import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../utils/context';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const store = new Map();
    store.set('lang', req.language || 'en');

    requestContext.run(store, () => {
        next();
    });
};