import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tawin E-commerce API',
            version: '1.0.0',
            description: 'API documentation for the Tawin construction marketplace',
        },
        servers: [
            {
                url: 'http://localhost:3520/api',
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication and account management' },
            { name: 'User', description: 'User profile and management' },
            { name: 'Category', description: 'Product category management' },
            { name: 'Product', description: 'Product catalog and stock' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },

                ConstructionBasket: {
                    type: 'object',
                    properties: {
                        isApplied: { type: 'boolean' },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        fullRegistrationName: { type: 'string' },
                        phoneNumber: { type: 'string' },
                        monthlyIncome: { type: 'number' },
                        occupation: { type: 'string' },
                        unifiedCard: { type: 'string' },
                        residenceCard: { type: 'string' },
                        propertyArea: { type: 'string' },
                        propertyType: { type: 'string', enum: ['Freehold', 'Leasehold'] },
                        country: { type: 'string' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        username: { type: 'string' },
                        profileImage: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        country: { type: 'string' },
                        constructionBasket: { $ref: '#/components/schemas/ConstructionBasket' }
                    }
                },
                BasketRequest: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'User ID' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        constructionBasket: { $ref: '#/components/schemas/ConstructionBasket' }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: {
                            type: 'object',
                            properties: {
                                en: { type: 'string' },
                                ar: { type: 'string' }
                            }
                        },
                        slug: { type: 'string' },
                        thumbnail: { type: 'string' },
                        icon: { type: 'string' },
                        description: {
                            type: 'object',
                            properties: {
                                en: { type: 'string' },
                                ar: { type: 'string' }
                            }
                        },
                        parent: { type: 'string', description: 'Parent Category ID (ObjectId)' },
                        isActive: { type: 'boolean' }
                    },
                },

                Product: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: {
                            type: 'object',
                            properties: {
                                en: { type: 'string' },
                                ar: { type: 'string' }
                            }
                        },
                        slug: { type: 'string' },
                        category: { type: 'string', description: 'Category ID' },
                        description: {
                            type: 'object',
                            properties: {
                                en: { type: 'string' },
                                ar: { type: 'string' }
                            }
                        },
                        price: { type: 'number' },
                        originalPrice: { type: 'number' },
                        image: { type: 'string' },
                        measurements: { type: 'string' },
                        remainingPieces: { type: 'number' },
                        isNewArrival: { type: 'boolean' },
                        rating: { type: 'number' },
                        reviewCount: { type: 'number' }
                    }
                },

                Review: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string', description: 'User ID' },
                        product: { type: 'string', description: 'Product ID' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                }
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/routes/index.ts'],
};

export const specs = swaggerJsdoc(options);