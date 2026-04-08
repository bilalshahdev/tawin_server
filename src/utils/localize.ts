import { Types } from 'mongoose';

/**
 * Recursively flattens localized objects based on the requested language.
 */
export const localizeData = (data: any, lang: string): any => {
    // 1. Base case: If not an object or is null, return as is
    if (!data || typeof data !== 'object') return data;

    // 2. Security: Stop recursion for BSON/Mongoose types
    if (data instanceof Date || data instanceof Types.ObjectId || data._bsontype) {
        return data;
    }

    // 3. Handle Arrays (e.g., your subcategories array)
    if (Array.isArray(data)) {
        return data.map(item => localizeData(item, lang));
    }

    const result: any = {};
    for (const key in data) {
        // Skip internal Mongoose/Node properties to prevent infinite loops
        if (key.startsWith('$') || key.startsWith('_')) {
            result[key] = data[key];
            continue;
        }

        const value = data[key];

        // 4. If it's a translation object { en: "...", ar: "..." }
        if (value && typeof value === 'object' && (value.en !== undefined || value.ar !== undefined)) {
            result[key] = value[lang] || value['en'] || "";
        }
        // 5. If it's a nested object, recurse safely
        else if (value && typeof value === 'object') {
            result[key] = localizeData(value, lang);
        }
        else {
            result[key] = value;
        }
    }
    return result;
};