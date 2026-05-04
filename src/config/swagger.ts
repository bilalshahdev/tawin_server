import swaggerJsdoc from 'swagger-jsdoc';
import { allSchemas } from './swagger-schemas';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tawin E-commerce API',
            version: '1.0.0',
            description: 'API documentation for the Tawin construction marketplace',
        },
        servers: [
            { url: 'http://localhost:3520/api', description: 'Local Development (Your PC)' },
            { url: 'http://104.128.190.131:3520/api', description: 'Staging/Testing Server (Hosted)' },
            { url: '/api', description: 'Dynamic (Uses current browser URL)' },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication and account management' },
            { name: 'User', description: 'User profile and management' },
            { name: 'Address', description: 'User shipping addresses' },
            { name: 'Category', description: 'Product category management' },
            { name: 'Product', description: 'Product catalog and stock' },
            { name: 'Brand', description: 'Brand management' },
            { name: 'Cart', description: 'Shopping cart operations' },
            { name: 'Coupon', description: 'Coupon management and validation' },
            { name: 'Order', description: 'Order management and checkout flow' },
            { name: 'Review', description: 'Product reviews and ratings' },
            { name: 'Favorite', description: 'User favorite products' },
            { name: 'Notification', description: 'In-app notifications' },
            { name: 'Contact', description: 'Contact form submissions' },
            { name: 'Supplier', description: 'Supplier and supply log management' },
            { name: 'Settings', description: 'Application settings and CMS' },
            { name: 'Staff', description: 'Staff accounts and permissions' },
            { name: 'Admin', description: 'Admin management APIs' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            parameters: {
                acceptLanguage: {
                    in: 'header',
                    name: 'Accept-Language',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['en', 'ar'],
                        default: 'en',
                    },
                    description: 'Language preference for the response (en for English, ar for Arabic)',
                },
                Period: {
                    in: 'query',
                    name: 'period',
                    description: 'The time range for the data',
                    required: false,
                    schema: {
                        type: 'string',
                        enum: ['daily', 'weekly', 'monthly', 'yearly', 'all-time'],
                        default: 'monthly',
                    },
                },
            },
            schemas: allSchemas,
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/routes/index.ts'],
};

const specs = swaggerJsdoc(options) as any;

// Inject the Accept-Language header parameter into every operation so we don't have to repeat
// `- $ref: '#/components/parameters/acceptLanguage'` in every JSDoc block.
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
const ACCEPT_LANG_REF = '#/components/parameters/acceptLanguage';

if (specs.paths) {
    for (const pathItem of Object.values<any>(specs.paths)) {
        for (const method of Object.keys(pathItem)) {
            if (!HTTP_METHODS.includes(method.toLowerCase())) continue;

            const operation = pathItem[method];
            operation.parameters = operation.parameters || [];

            const alreadyHas = operation.parameters.some((p: any) => p?.$ref === ACCEPT_LANG_REF);
            if (!alreadyHas) {
                operation.parameters.push({ $ref: ACCEPT_LANG_REF });
            }
        }
    }
}

export { specs };
