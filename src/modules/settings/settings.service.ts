import { Settings } from './settings.model';
import { ISettings } from './settings.types';

export const getSettings = async (): Promise<ISettings> => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({
            businessName: { en: "Tawin" },
            header: {
                landing_page: { text: { en: "" }, image: "" },
                home: { text: { en: "" }, image: "" },
                shop: { text: { en: "" }, image: "" }
            }
        });
    }
    return settings as ISettings;
};

export const updateSettings = async (updateData: any): Promise<ISettings | null> => {
    return await Settings.findOneAndUpdate({}, { $set: updateData }, {
        new: true,
        upsert: true,
        runValidators: true
    }) as ISettings | null;
};