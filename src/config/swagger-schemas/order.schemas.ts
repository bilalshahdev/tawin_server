export const orderSchemas = {
    Order: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            user: { $ref: '#/components/schemas/ObjectId' },
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        product: { $ref: '#/components/schemas/ObjectId' },
                        quantity: { type: 'number' },
                        price: { type: 'number' },
                    },
                },
            },
            totalAmount: { type: 'number' },
            discountAmount: { type: 'number' },
            finalAmount: { type: 'number' },
            shippingAddress: { type: 'string' },
            shippingType: { type: 'string', enum: ['free', 'express'] },
            phone: { type: 'string' },
            status: {
                type: 'string',
                enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            paymentMethod: { type: 'string', example: 'COD' },
            couponCode: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
        },
    },

    OrderStats: {
        type: 'object',
        properties: {
            total: { type: 'integer', example: 142 },
            pending: { type: 'integer', example: 12 },
            processing: { type: 'integer', example: 8 },
            shipped: { type: 'integer', example: 5 },
            delivered: { type: 'integer', example: 110 },
            canceled: { type: 'integer', example: 7 },
        },
    },
};
