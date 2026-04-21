import { deleteFile } from '../../utils/deleteFile';
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

export const updateSettings = async (updateData: any): Promise<any> => {
    // 1. Get the current settings to check for old file paths
    const currentSettings = await Settings.findOne();

    // 2. Perform the update
    const updated = await Settings.findOneAndUpdate({}, { $set: updateData }, {
        new: true,
        upsert: true,
        runValidators: true
    });

    // 3. Clean up old files from storage
    if (currentSettings) {
        for (const path in updateData) {
            // Check if the update contains a path that matches an image field
            // and if the value has actually changed
            const oldValue = (currentSettings as any).get(path);
            const newValue = updateData[path];

            if (path.toLowerCase().includes('image') || path === 'logo') {
                if (oldValue && oldValue !== newValue) {
                    deleteFile(oldValue); // This removes the old physical file
                }
            }
        }
    }

    return updated;
};