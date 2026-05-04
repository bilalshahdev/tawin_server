export const settingsSchemas = {
    SocialLinks: {
        type: 'object',
        properties: {
            facebook: { type: 'string', format: 'uri' },
            instagram: { type: 'string', format: 'uri' },
            whatsapp: { type: 'string', format: 'uri' },
            youtube: { type: 'string', format: 'uri' },
        },
    },

    Pages: {
        type: 'object',
        properties: {
            privacyPolicy: { $ref: '#/components/schemas/LocalizedString' },
            termsAndConditions: { $ref: '#/components/schemas/LocalizedString' },
            about: { $ref: '#/components/schemas/LocalizedString' },
        },
    },

    Settings: {
        type: 'object',
        properties: {
            enableContactEmail: { type: 'boolean' },
            businessName: { $ref: '#/components/schemas/LocalizedString' },
            tagline: { $ref: '#/components/schemas/LocalizedString' },
            logo: { type: 'string' },
            coverImage: { type: 'string' },
            currency: { type: 'string' },
            currencySymbol: { type: 'string' },
            header: {
                type: 'object',
                properties: {
                    landing_page: { $ref: '#/components/schemas/HeaderSection' },
                    home: { $ref: '#/components/schemas/HeaderSection' },
                    shop: { $ref: '#/components/schemas/HeaderSection' },
                },
            },
            about: { $ref: '#/components/schemas/LocalizedString' },
            contactFormImage: { type: 'string' },
            bottomSectionImage: { type: 'string' },
            pages: { $ref: '#/components/schemas/Pages' },
            contactInfo: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: {
                        type: 'object',
                        properties: {
                            city: { type: 'string' },
                            state: { type: 'string' },
                            country: { type: 'string' },
                        },
                    },
                },
            },
            socialLinks: { $ref: '#/components/schemas/SocialLinks' },
        },
    },
};
