export const notificationSchemas = {
    Notification: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            recipient: { $ref: '#/components/schemas/ObjectId' },
            recipientType: {
                type: 'string',
                enum: ['User', 'Staff'],
                readOnly: true,
            },
            title: { type: 'string' },
            message: { type: 'string' },
            type: {
                type: 'string',
                enum: ['order', 'coupon', 'system'],
                readOnly: true,
            },
            metadata: {
                type: 'object',
                additionalProperties: true,
            },
            isRead: {
                type: 'boolean',
                default: false,
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                readOnly: true,
            },
        },
    },
};
