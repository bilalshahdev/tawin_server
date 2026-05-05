export const staffSchemas = {
    Permission: {
        type: 'object',
        required: ['module', 'operations'],
        properties: {
            module: {
                type: 'string',
                enum: [
                    'dashboard', 'orders', 'users', 'categories', 'brands', 'staff', 'products', 'sales',
                    'construction-basket', 'reviews', 'suppliers',
                    'coupons', 'financial', 'stock',
                ],
            },
            operations: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['get', 'post', 'patch', 'put', 'delete'],
                },
            },
        },
    },

    CreateStaff: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'staff@example.com' },
            password: { type: 'string', format: 'password', example: 'securePass123' },
            phone: { type: 'string', example: '+123456789' },
            permissions: {
                type: 'array',
                items: { $ref: '#/components/schemas/Permission' },
            },
        },
    },

    UpdateStaff: {
        type: 'object',
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            isActive: { type: 'boolean' },
            permissions: {
                type: 'array',
                items: { $ref: '#/components/schemas/Permission' },
            },
            profileImage: { type: 'string', format: 'binary' },
        },
    },

    Staff: {
        type: 'object',
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', example: 'staff', readOnly: true },
            isActive: { type: 'boolean' },
            phone: { type: 'string' },
            profileImage: { type: 'string' },
            permissions: {
                type: 'array',
                items: { $ref: '#/components/schemas/Permission' },
            },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },
};
