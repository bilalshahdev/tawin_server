import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
        },
    },
    apis: [process.env.NODE_ENV === 'production'
        ? './dist/http/routes/*.js'
        : './src/http/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);