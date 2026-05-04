import i18next from 'i18next';
import middleware from 'i18next-http-middleware';
import fs from 'fs';
import path from 'path';

const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;

// Locales live next to the build/runtime CWD. Both `npm run dev` and `npm start`
// are invoked from the project root, so a CWD-relative path works in both modes.
const LOCALES_DIR = path.resolve(process.cwd(), 'locales');

// Read every JSON file inside locales/<lng>/ and use the filename (sans .json)
// as the top-level namespace key. This keeps call sites flat — `req.t('coupon.created')`
// continues to work because `coupon.json` becomes the `coupon` key in the merged bundle.
const loadLanguage = (lng: string): Record<string, unknown> => {
    const dir = path.join(LOCALES_DIR, lng);
    if (!fs.existsSync(dir)) return {};

    const merged: Record<string, unknown> = {};
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.json')) continue;
        const ns = path.basename(file, '.json');
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        merged[ns] = JSON.parse(raw);
    }
    return merged;
};

const resources = SUPPORTED_LANGUAGES.reduce((acc, lng) => {
    acc[lng] = { translation: loadLanguage(lng) };
    return acc;
}, {} as Record<string, { translation: Record<string, unknown> }>);

i18next
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: 'en',
        supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
        resources,
        interpolation: { escapeValue: false },
    });

export default i18next;
