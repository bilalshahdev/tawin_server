import { AsyncLocalStorage } from 'node:async_hooks';

export const requestContext = new AsyncLocalStorage<Map<string, any>>();

/**
 * Gets the current request language from the async store
 */
export const getLang = (): string => {
    const store = requestContext.getStore();
    return store?.get('lang') || 'en';
};