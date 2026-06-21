import { Schema, model } from 'mongoose';

// sectionSchema

const sectionSchema = {
    text: { en: String, ar: String },
    image: String,
    _id: false
}

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
        landing_page: sectionSchema,
        home: sectionSchema,
        shop: sectionSchema
    },

    about: { en: String, ar: String },
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },

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
        facebook: String,
        instagram: String,
        whatsapp: String,
        youtube: String,
    }
}, { timestamps: true });

export const Settings = model('Settings', settingsSchema);
