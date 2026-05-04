export const userSchemas = {
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
            isVerified: { type: 'boolean', readOnly: true },
            country: { type: 'string' },
            constructionBasket: { $ref: '#/components/schemas/ConstructionBasket' },
        },
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
};
