export const couponSchemas = {
    Coupon: {
        type: 'object',
        required: ['code', 'type', 'value', 'expiryDate', 'usageLimit'],
        properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            code: { type: 'string', example: 'SAVE20' },
            type: {
                type: 'string',
                enum: ['percentage', 'fixed'],
                example: 'percentage',
                description: 'Discount type: percentage of subtotal, or fixed amount.',
            },
            value: {
                type: 'number',
                description:
                    'Discount value. For percentage coupons this is the % (e.g. 20 = 20%); for fixed coupons it is the absolute amount.',
                example: 20,
            },
            minOrderAmount: {
                type: 'number',
                example: 100,
                description:
                    'Minimum cart total (full cart, not eligible subtotal) required for the coupon to be usable.',
            },
            expiryDate: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59Z' },
            usageLimit: { type: 'number', example: 500 },
            usedCount: { type: 'number', example: 0, readOnly: true },
            usedBy: {
                type: 'array',
                items: { $ref: '#/components/schemas/ObjectId' },
                readOnly: true,
                description:
                    'Users who have already redeemed this coupon (each user can use a coupon at most once).',
            },
            isActive: { type: 'boolean', example: true },
            appliesTo: {
                type: 'string',
                enum: ['all', 'category', 'product'],
                default: 'all',
                description:
                    'Scope of the coupon: "all" = any cart; "category" = items in selected categories only; "product" = selected products only.',
            },
            categories: {
                type: 'array',
                items: { $ref: '#/components/schemas/ObjectId' },
                description: 'Required (non-empty) when appliesTo = "category". Ignored otherwise.',
            },
            products: {
                type: 'array',
                items: { $ref: '#/components/schemas/ObjectId' },
                description: 'Required (non-empty) when appliesTo = "product". Ignored otherwise.',
            },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
        },
    },

    CouponStats: {
        type: 'object',
        properties: {
            totalCoupons: { type: 'number' },
            activeCoupons: { type: 'number' },
            expiredCoupons: { type: 'number' },
            totalUsageCount: { type: 'number' },
        },
    },

    CouponValidationResponse: {
        type: 'object',
        properties: {
            coupon: { $ref: '#/components/schemas/Coupon' },
            discountAmount: {
                type: 'number',
                example: 25.5,
                description: 'The discount amount applied. Computed against eligibleSubtotal, not cartTotal.',
            },
            eligibleSubtotal: {
                type: 'number',
                example: 127.5,
                description:
                    'Sum of the cart items the coupon scope applies to. Equals cartTotal when appliesTo = "all".',
            },
            cartTotal: {
                type: 'number',
                example: 250,
                description: 'Sum of the entire cart (used for the minOrderAmount gate).',
            },
        },
    },
};
