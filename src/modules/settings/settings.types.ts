import { Document } from 'mongoose';

export interface LocalizedString {
    en: string;
    ar?: string;
}

export interface Address {
    city?: string;
    state?: string;
    country?: string;
}

export interface ContactInfo {
    email?: string;
    phone?: string;
    address?: Address;
}

export interface SocialLinks {
    facebook?: URL;
    instagram?: URL;
    whatsapp?: URL;
    youtube?: URL;
}

export interface HeaderSection {
    landing_page: {
        text: LocalizedString;
        image: string;
    };
    home: {
        text: LocalizedString;
        image: string;
    };
    shop: {
        text: LocalizedString;
        image: string;
    };
}

export interface Pages {
    privacyPolicy: LocalizedString;
    termsAndConditions: LocalizedString;
    about: LocalizedString;
}

export interface ISettings extends Document {
    enableContactEmail: boolean;
    businessName: LocalizedString;
    tagline?: LocalizedString;
    logo?: string;
    coverImage?: string;
    currency: string;
    currencySymbol: string;
    header: HeaderSection;
    about: LocalizedString;
    contactFormImage?: string;
    bottomSectionImage?: string;
    contactInfo: ContactInfo;
    socialLinks: SocialLinks;
    pages: Pages;
    createdAt: Date;
    updatedAt: Date;
}