import { z } from 'zod';

export const updateSettingsSchema = z.object({
    body: z.object({
        // Boolean conversion for form-data
        enableContactEmail: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),

        // Dot notation mapping for Business Info
        "businessName.en": z.string().optional(),
        "businessName.ar": z.string().optional(),
        "tagline.en": z.string().optional(),
        "tagline.ar": z.string().optional(),
        "about.en": z.string().optional(),
        "about.ar": z.string().optional(),
        "currency": z.string().optional(),
        "currencySymbol": z.string().optional(),

        // Dot notation mapping for Header Section
        "header.landing_page.text.en": z.string().optional(),
        "header.landing_page.text.ar": z.string().optional(),
        "header.home.text.en": z.string().optional(),
        "header.home.text.ar": z.string().optional(),

        // Dot notation mapping for Pages
        "pages.privacyPolicy.en": z.string().optional(),
        "pages.privacyPolicy.ar": z.string().optional(),
        "pages.termsAndConditions.en": z.string().optional(),
        "pages.termsAndConditions.ar": z.string().optional(),
        "pages.about.en": z.string().optional(),
        "pages.about.ar": z.string().optional(),

        // Social Links
        "socialLinks.whatsapp": z.string().url().optional().or(z.literal('')),
        "socialLinks.facebook": z.string().url().optional().or(z.literal('')),
        "socialLinks.instagram": z.string().url().optional().or(z.literal('')),
        "socialLinks.twitter": z.string().url().optional().or(z.literal('')),
    }).passthrough(),
});