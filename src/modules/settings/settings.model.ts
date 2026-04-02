import { Schema, model } from 'mongoose';

// Validator for URL fields
const urlValidator = (v: string) => /^https?:\/\/.+$/.test(v);

const settingsSchema = new Schema({
    enableContactEmail: { type: Boolean, default: false },

    businessName: {
        en: { type: String, default: "Tawin" },
        ar: { type: String, default: "تاوين" }
    },

    tagline: {
        en: String,
        ar: String
    },

    logo: String,
    coverImage: String,

    header: {
        landing_page: {
            text: { en: String, ar: String },
            image: String
        },
        home: {
            text: { en: String, ar: String },
            image: String
        }
    },

    about: { en: String, ar: String },

    contactFormImage: String,
    bottomSectionImage: String,

    pages: {
        privacyPolicy: { en: String, ar: String },
        termsAndConditions: { en: String, ar: String },
        about: { en: String, ar: String }
    },

    copyrightText: {
        en: String,
        ar: String
    },

    contactInfo: {
        email: String,
        phone: String,
        address: {
            city: String,
            state: String,
            country: String
        }
    },

    socialLinks: {
        facebook: { type: String, validate: { validator: urlValidator, message: (v: any) => `${v.value} is not a valid URL!` } },
        instagram: { type: String, validate: { validator: urlValidator, message: (v: any) => `${v.value} is not a valid URL!` } },
        whatsapp: String,
        youtube: { type: String, validate: { validator: urlValidator, message: (v: any) => `${v.value} is not a valid URL!` } },
    }
}, { timestamps: true });

export const Settings = model('Settings', settingsSchema);