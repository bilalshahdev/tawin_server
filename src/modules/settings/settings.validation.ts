import { z } from 'zod';

const localizedStringSchema = z.object({
    en: z.string().min(1),
    ar: z.string().optional(),
});

export const updateSettingsSchema = z.object({
    body: z.object({
        enableContactEmail: z.preprocess((val) => val === 'true', z.boolean()).optional(),
        "businessName[en]": z.string().optional(),
        "businessName[ar]": z.string().optional(),
        "tagline[en]": z.string().optional(),
        "tagline[ar]": z.string().optional(),
        "header[landing_page][text][en]": z.string().optional(),
        "header[landing_page][text][ar]": z.string().optional(),
        "header[home][text][en]": z.string().optional(),
        "header[home][text][ar]": z.string().optional(),
        "about[en]": z.string().optional(),
        "about[ar]": z.string().optional(),
        "pages[privacyPolicy][en]": z.string().optional(),
        "pages[privacyPolicy][ar]": z.string().optional(),
        "pages[termsAndConditions][en]": z.string().optional(),
        "pages[termsAndConditions][ar]": z.string().optional(),
        "pages[about][en]": z.string().optional(),
        "pages[about][ar]": z.string().optional(),
        "socialLinks[whatsapp]": z.url().optional(),
        "socialLinks[facebook]": z.url().optional(),
        "socialLinks[instagram]": z.url().optional(),
        "socialLinks[twitter]": z.url().optional(),
    }).passthrough(),
});