import { z } from 'zod';

// Multer can parse multipart fields with bracket notation like
// `businessName[en]` into nested objects. Keep support for both the raw bracket
// keys and the nested object shape so older and newer clients both validate.

const optionalString = z
    .preprocess((val) => (val == null || val === 'undefined' || val === 'null' ? '' : val), z.string())
    .optional();
const optionalBoolFromForm = z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .optional();

const localizedStringSchema = z.object({
    en: optionalString,
    ar: optionalString,
}).strict().optional();

const headerSectionSchema = z.object({
    text: localizedStringSchema,
}).strict().optional();

export const updateSettingsSchema = z.object({
    body: z.object({
        enableContactEmail: optionalBoolFromForm,

        businessName: localizedStringSchema,
        tagline: localizedStringSchema,
        about: localizedStringSchema,
        socialLinks: z.object({
            whatsapp: optionalString,
            facebook: optionalString,
            instagram: optionalString,
            twitter: optionalString,
            youtube: optionalString,
        }).strict().optional(),
        header: z.object({
            landing_page: headerSectionSchema,
            home: headerSectionSchema,
            shop: headerSectionSchema,
        }).strict().optional(),
        pages: z.object({
            privacyPolicy: localizedStringSchema,
            termsAndConditions: localizedStringSchema,
            about: localizedStringSchema,
        }).strict().optional(),

        // Business info
        "businessName[en]": optionalString,
        "businessName[ar]": optionalString,
        "tagline[en]": optionalString,
        "tagline[ar]": optionalString,
        "about[en]": optionalString,
        "about[ar]": optionalString,
        currency: optionalString,
        currencySymbol: optionalString,

        // Header sections
        "header[landing_page][text][en]": optionalString,
        "header[landing_page][text][ar]": optionalString,
        "header[home][text][en]": optionalString,
        "header[home][text][ar]": optionalString,
        "header[shop][text][en]": optionalString,
        "header[shop][text][ar]": optionalString,

        // Pages content
        "pages[privacyPolicy][en]": optionalString,
        "pages[privacyPolicy][ar]": optionalString,
        "pages[termsAndConditions][en]": optionalString,
        "pages[termsAndConditions][ar]": optionalString,
        "pages[about][en]": optionalString,
        "pages[about][ar]": optionalString,

        // Social links
        "socialLinks[whatsapp]": optionalString,
        "socialLinks[facebook]": optionalString,
        "socialLinks[instagram]": optionalString,
        "socialLinks[twitter]": optionalString,
        "socialLinks[youtube]": optionalString,
    }).strict(),
});

export const updateSocialLinksSchema = z.object({
    body: z.object({
        facebook: optionalString,
        instagram: optionalString,
        whatsapp: optionalString,
        youtube: optionalString,
        twitter: optionalString,
    }).strict(),
});

export const updatePagesSchema = z.object({
    body: z.object({
        privacyPolicy: z.object({
            en: optionalString,
            ar: optionalString,
        }).strict().optional(),
        termsAndConditions: z.object({
            en: optionalString,
            ar: optionalString,
        }).strict().optional(),
        about: z.object({
            en: optionalString,
            ar: optionalString,
        }).strict().optional(),
    }).strict(),
});
