const digitMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
};

export const normalizePhone = (phone?: unknown) => {
    if (typeof phone !== "string") return undefined;
    if (!phone) return undefined;

    const normalized = phone
        .trim()
        .split("")
        .map((char) => digitMap[char] || char)
        .join("")
        .replace(/[()\s-]/g, "");

    return normalized || undefined;
};
