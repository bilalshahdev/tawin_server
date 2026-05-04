export const cartSchemas = {
    CartItem: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
            productId: { type: 'string', example: '660d1a2b3c4d5e6f7g8h9002' },
            quantity: { type: 'integer', minimum: 1 },
        },
    },

    Cart: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            user: { $ref: '#/components/schemas/ObjectId' },
            items: {
                type: 'array',
                items: { $ref: '#/components/schemas/CartItem' },
            },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },

    RemoveCartItem: {
        type: 'object',
        required: ['productId'],
        properties: {
            productId: { type: 'string', example: '660d1a2b3c4d5e6f7g8h9002' },
        },
    },
};
