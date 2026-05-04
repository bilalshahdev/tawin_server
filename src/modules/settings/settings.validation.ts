import { z } from 'zod';

// Form-data sends localized fields with bracket notation: `businessName[en]`.
// The settings controller converts these to dot-notation paths before saving.
// Validate them in their incoming bracket form, then `.strict()` rejects any
// key that isn't explicitly whitelisted here.

const optionalString = z.string().optional();
const optionalUrl = z.string().url().optional().or(z.literal(''));
const optionalBoolFromForm = z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .optional();

export const updateSettingsSchema = z.object({
    body: z.object({
        enableContactEmail: optionalBoolFromForm,

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

        // Pages content
        "pages[privacyPolicy][en]": optionalString,
        "pages[privacyPolicy][ar]": optionalString,
        "pages[termsAndConditions][en]": optionalString,
        "pages[termsAndConditions][ar]": optionalString,
        "pages[about][en]": optionalString,
        "pages[about][ar]": optionalString,

        // Social links
        "socialLinks[whatsapp]": optionalUrl,
        "socialLinks[facebook]": optionalUrl,
        "socialLinks[instagram]": optionalUrl,
        "socialLinks[twitter]": optionalUrl,
        "socialLinks[youtube]": optionalUrl,
    }).strict(),
});

export const updateSocialLinksSchema = z.object({
    body: z.object({
        facebook: optionalUrl,
        instagram: optionalUrl,
        whatsapp: optionalUrl,
        youtube: optionalUrl,
        twitter: optionalUrl,
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