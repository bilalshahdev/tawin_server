export const contactSchemas = {
    Contact: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            message: { type: 'string', example: 'I need help with my order.' },
            createdAt: { type: 'string', format: 'date-time' },
        },
    },
};
