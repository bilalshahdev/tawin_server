export const supplierSchemas = {
    Supplier: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1', readOnly: true },
            name: { type: 'string', example: 'Lucky Cement Ltd' },
            code: { type: 'string', example: 'SUP-001' },
            phone: { type: 'string', example: '+923001234567' },
            isActive: { type: 'boolean' },
            suppliedProducts: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },

    SupplyLog: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1', readOnly: true },
            supplier: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1', readOnly: true },
            product: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1', readOnly: true },
            supplierQuantity: { type: 'number' },
            supplierUnit: { type: 'string', enum: ['piece', 'ton'] },
            stockIncrement: { type: 'number' },
            costPrice: { type: 'number' },
            sacksCount: { type: 'number' },
            note: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },
};
