export const reviewSchemas = {
    ReviewInput: {
        type: 'object',
        required: ['product', 'rating'],
        properties: {
            product: { $ref: '#/components/schemas/ObjectId' },
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
        },
    },

    Review: {
        type: 'object',
        required: ['product', 'rating'],
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            user: { $ref: '#/components/schemas/ObjectId' },
            product: { $ref: '#/components/schemas/ObjectId' },
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },
};
