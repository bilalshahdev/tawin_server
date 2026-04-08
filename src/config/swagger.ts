import swaggerJsdoc from 'swagger-jsdoc';
import { readonly } from 'zod';

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
            { name: 'Settings', description: 'Application settings and CMS' },
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
                        default: 'en'
                    },
                    description: 'Language preference for the response (en for English, ar for Arabic)'
                }
            },
            schemas: {

                ObjectId: {
                    type: 'string',
                    example: '64f1c2a9e4b0c123456789ab',
                },

                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },

                LocalizedString: {
                    type: 'object',
                    properties: {
                        en: { type: 'string' },
                        ar: { type: 'string' },
                    },
                },

                HeaderSection: {
                    type: 'object',
                    properties: {
                        text: { $ref: '#/components/schemas/LocalizedString' },
                        image: { type: 'string', format: 'binary' },
                    },
                },

                AuthRegister: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email', 'username', 'password'],
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        username: { type: 'string' },
                        password: { type: 'string', format: 'password' },
                        country: { type: 'string' },
                    },
                },

                AuthLogin: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },

                ResendOtp: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                    },
                },

                VerifyOtp: {
                    type: 'object',
                    required: ['email', 'otp'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        otp: { type: 'string' },
                    },
                },

                ForgotPassword: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                    },
                },

                ResetPassword: {
                    type: 'object',
                    required: ['email', 'token', 'newPassword'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        token: { type: 'string' },
                        newPassword: { type: 'string' },
                    },
                },

                ChangeEmail: {
                    type: 'object',
                    required: ['newEmail'],
                    properties: {
                        newEmail: { type: 'string', format: 'email' },
                    },
                },

                ChangePassword: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { type: 'string' },
                        newPassword: { type: 'string' },
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
                        country: { type: 'string' },
                    },
                },

                User: {
                    type: 'object',
                    properties: {
                        _id: { $ref: '#/components/schemas/ObjectId' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        username: { type: 'string' },
                        profileImage: { type: 'string' },
                        isVerified: { type: 'boolean' },
                        country: { type: 'string' },
                        constructionBasket: { $ref: '#/components/schemas/ConstructionBasket' },
                    },
                },
                AddressInput: {
                    type: 'object',
                    required: ['street', 'city', 'state', 'country'],
                    properties: {
                        label: { type: 'string', example: 'Home' },
                        street: { type: 'string', example: '123 Main St' },
                        city: { type: 'string', example: 'Islamabad' },
                        state: { type: 'string', example: 'Punjab' },
                        zipCode: { type: 'string', example: '44000' },
                        country: { type: 'string', example: 'Pakistan' },
                        isDefault: { type: 'boolean' },
                    }
                },
                Address: {
                    allOf: [
                        { $ref: '#/components/schemas/AddressInput' },
                        {
                            type: 'object',
                            properties: {
                                _id: { $ref: '#/components/schemas/ObjectId' },
                                user: { $ref: '#/components/schemas/ObjectId' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },

                BasketRequest: {
                    type: 'object',
                    properties: {
                        _id: { $ref: '#/components/schemas/ObjectId' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        constructionBasket: { $ref: '#/components/schemas/ConstructionBasket' },
                    },
                },

                Category: {
                    type: 'object',
                    properties: {
                        _id: { $ref: '#/components/schemas/ObjectId' },
                        name: { $ref: '#/components/schemas/LocalizedString' },
                        slug: { type: 'string' },
                        thumbnail: { type: 'string' },
                        icon: { type: 'string' },
                        description: { $ref: '#/components/schemas/LocalizedString' },
                        parent: { $ref: '#/components/schemas/ObjectId' },
                        isActive: { type: 'boolean' },
                    },
                },

                Product: {
                    type: 'object',
                    properties: {
                        _id: { $ref: '#/components/schemas/ObjectId' },
                        title: { $ref: '#/components/schemas/LocalizedString' },
                        slug: { type: 'string' },
                        category: { $ref: '#/components/schemas/ObjectId' },
                        description: { $ref: '#/components/schemas/LocalizedString' },
                        price: { type: 'number' },
                        originalPrice: { type: 'number' },
                        images: { type: 'array', items: { type: 'string' } },
                        measurements: { type: 'string' },
                        remainingPieces: { type: 'number' },
                        isNewArrival: { type: 'boolean' },
                        rating: { type: 'number' },
                        reviewCount: { type: 'number' },
                    },
                },

                Review: {
                    type: 'object',
                    properties: {
                        _id: { $ref: '#/components/schemas/ObjectId' },
                        user: { $ref: '#/components/schemas/ObjectId' },
                        product: { $ref: '#/components/schemas/ObjectId' },
                        rating: { type: 'number', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },

                Settings: {
                    type: 'object',
                    properties: {
                        enableContactEmail: { type: 'boolean' },
                        businessName: { $ref: '#/components/schemas/LocalizedString' },
                        tagline: { $ref: '#/components/schemas/LocalizedString' },
                        logo: { type: 'string' },
                        coverImage: { type: 'string' },
                        header: {
                            type: 'object',
                            properties: {
                                landing_page: { $ref: '#/components/schemas/HeaderSection' },
                                home: { $ref: '#/components/schemas/HeaderSection' },
                            },
                        },
                        about: { $ref: '#/components/schemas/LocalizedString' },
                        contactFormImage: { type: 'string' },
                        bottomSectionImage: { type: 'string' },
                        pages: { $ref: '#/components/schemas/Pages' },
                        contactInfo: {
                            type: 'object',
                            properties: {
                                email: { type: 'string', format: 'email' },
                                phone: { type: 'string' },
                                address: {
                                    type: 'object',
                                    properties: {
                                        city: { type: 'string' },
                                        state: { type: 'string' },
                                        country: { type: 'string' },
                                    },
                                },
                            },
                        },
                        socialLinks: { $ref: '#/components/schemas/SocialLinks' },
                    },
                },

                SocialLinks: {
                    type: 'object',
                    properties: {
                        facebook: { type: 'string', format: 'uri' },
                        instagram: { type: 'string', format: 'uri' },
                        whatsapp: { type: 'string', format: 'uri' },
                        youtube: { type: 'string', format: 'uri' },
                    },
                },

                Pages: {
                    type: 'object',
                    properties: {
                        privacyPolicy: { $ref: '#/components/schemas/LocalizedString' },
                        termsAndConditions: { $ref: '#/components/schemas/LocalizedString' },
                        about: { $ref: '#/components/schemas/LocalizedString' },
                    },
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/routes/index.ts'],
};

const specs = swaggerJsdoc(options) as any;

if (specs.paths) {
    Object.values(specs.paths).forEach((path: any) => {
        // Loop through all methods (get, post, patch, etc.) in this path
        Object.values(path).forEach((operation: any) => {
            // Initialize parameters array if it doesn't exist
            if (!operation.parameters) operation.parameters = [];

            // Push the reference to our global language parameter
            operation.parameters.push({
                $ref: '#/components/parameters/acceptLanguage'
            });
        });
    });
}

export { specs };