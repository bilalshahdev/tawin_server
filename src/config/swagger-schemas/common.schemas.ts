export const commonSchemas = {
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

    Pagination: {
        type: 'object',
        properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 },
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
};
