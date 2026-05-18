import { Contact } from './contact.model';
import { Settings } from '../settings/settings.model';
import { sendEmail } from '../../services/email.service';
import { t } from 'i18next';

export const createContactEntry = async (contactData: any, userId: string | null, lng: string = 'en') => {
    // 1. Store in DB
    const newContact = await Contact.create({
        ...contactData,
        userId
    });

    // 2. Fetch Settings
    const settings = await Settings.findOne();

    if (settings?.enableContactEmail && settings?.contactInfo?.email) {
        // Get translation function for specific language (from request)
        const translate = (key: string, options?: any) => t(key, { ...options, lng });

        // Send email to Admin
        await sendEmail(
            settings.contactInfo.email,
            // Changed: Using a generic translation key since 'subject' is removed
            `${translate('emails.contact.admin_subject')}: ${contactData.name}`,
            `<p>${translate('emails.contact.admin_body', {
                name: contactData.name,
                email: contactData.email
            })}</p><p>${contactData.message}</p>`
        );

        // Send confirmation email to Customer
        await sendEmail(
            contactData.email,
            translate('emails.contact.customer_subject') as string,
            `<p>${translate('emails.contact.customer_body', { name: contactData.name })}</p>`
        );
    }

    return newContact;
};

// fetch contacts (paginated, with user data populated)

export const getContacts = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    const contacts = await Contact.find().populate('userId').skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Contact.countDocuments();
    return {
        contacts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

// delete contact
export const deleteContact = async (id: string) => {
    const contact = await Contact.findByIdAndDelete(id);
    return contact;
};