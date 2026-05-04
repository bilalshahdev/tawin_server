export const catalogSchemas = {
    Category: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            name: { $ref: '#/components/schemas/LocalizedString' },
            slug: { type: 'string' },
            thumbnail: { type: 'string' },
            description: { $ref: '#/components/schemas/LocalizedString' },
            parentCategory: { $ref: '#/components/schemas/ObjectId' },
        },
    },

    Product: {
        type: 'object',
        required: ['title', 'category', 'price'],
        properties: {
            _id: { type: 'string', readOnly: true },
            title: { $ref: '#/components/schemas/LocalizedString' },
            category: { type: 'string', description: 'Reference to Category ID' },
            price: { type: 'number', minimum: 0 },
            variant: { type: 'string', example: '50kg Bag' },
            remainingPieces: { type: 'integer', minimum: 0, default: 0 },
            isNewArrival: { type: 'boolean', default: true },
            isFeatured: { type: 'boolean', default: false },
            rating: { type: 'number', readOnly: true },
            reviewCount: { type: 'integer', readOnly: true },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },

    Brand: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            name: { $ref: '#/components/schemas/LocalizedString' },
            description: { $ref: '#/components/schemas/LocalizedString' },
            image: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },
};
