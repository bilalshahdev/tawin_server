export const addressSchemas = {
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
        },
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
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        ],
    },
};
