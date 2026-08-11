import crypto from "crypto";
import { config } from "../config/env.config";
import { logger } from "../config/logger";

type RasaelAuthResponse = {
    success?: boolean;
    result?: {
        accessToken?: string;
        expireDate?: string;
    };
    error?: unknown;
};

export class SmsProviderError extends Error {
    reason: "auth" | "delivery" | "config";

    constructor(reason: "auth" | "delivery" | "config", message: string) {
        super(message);
        this.reason = reason;
    }
}

let cachedAccessToken = "";
let cachedAccessTokenExpiresAt = 0;

export const isSmsConfigured = () => (
    config.smsService === "true" &&
    Boolean(config.rasaelAuthUrl) &&
    Boolean(config.rasaelSendUrl) &&
    Boolean(config.rasaelUsername) &&
    Boolean(config.rasaelPassword) &&
    Boolean(config.rasaelDefaultEmail)
);

const getRasaelAccessToken = async () => {
    const now = Date.now();
    if (cachedAccessToken && cachedAccessTokenExpiresAt > now + 60_000) {
        return cachedAccessToken;
    }

    const response = await fetch(config.rasaelAuthUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: config.rasaelUsername,
            password: config.rasaelPassword,
        }),
    });

    const data = await response.json() as RasaelAuthResponse;

    if (!response.ok || !data.success || !data.result?.accessToken) {
        logger.error(`Rasael authentication failed: ${JSON.stringify(data.error || data)}`);
        throw new SmsProviderError("auth", "SMS authentication failed");
    }

    cachedAccessToken = data.result.accessToken;
    cachedAccessTokenExpiresAt = data.result.expireDate
        ? new Date(data.result.expireDate).getTime()
        : now + 10 * 60 * 1000;

    return cachedAccessToken;
};

const formatPhoneForRasael = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const withoutInternationalPrefix = cleanPhone.startsWith("00")
        ? cleanPhone.slice(2)
        : cleanPhone;

    const countryCode = config.rasaelPhoneCountryCode.replace(/\D/g, "") || "964";
    const withoutPlus = withoutInternationalPrefix.startsWith("+")
        ? withoutInternationalPrefix.slice(1)
        : withoutInternationalPrefix;

    const internationalNumber = withoutPlus.startsWith(countryCode)
        ? withoutPlus
        : withoutPlus.startsWith("0")
            ? `${countryCode}${withoutPlus.slice(1)}`
            : withoutPlus;

    if (config.rasaelPhoneFormat === "e164") {
        return `+${internationalNumber}`;
    }

    if (config.rasaelPhoneFormat === "local" && internationalNumber.startsWith(countryCode)) {
        return `0${internationalNumber.slice(countryCode.length)}`;
    }

    return internationalNumber;
};

export const sendOtpSms = async (
    to: string,
    otpCode: string,
    options?: { email?: string; lang?: "en" | "ar" | "ku" },
) => {
    if (config.smsService !== "true") {
        logger.info(`SMS service disabled. Skipping OTP SMS to ${to}.`);
        return;
    }

    if (!isSmsConfigured()) {
        logger.warn("SMS service is enabled, but Rasael credentials are incomplete.");
        throw new SmsProviderError("config", "SMS service is not configured");
    }

    const email = options?.email || config.rasaelDefaultEmail;
    if (!email) {
        logger.warn("Rasael OTP request requires an email value. Set RASAEL_DEFAULT_EMAIL for phone-only users.");
        throw new SmsProviderError("config", "SMS recipient email is not configured");
    }

    const formattedTo = formatPhoneForRasael(to);
    const accessToken = await getRasaelAccessToken();
    const response = await fetch(config.rasaelSendUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requestId: crypto.randomUUID(),
            to: formattedTo,
            email,
            type: 1,
            lang: options?.lang || config.rasaelDefaultLang,
            params: {
                otpCode,
            },
        }),
    });

    const data = await response.json().catch(() => null) as any;

    if (!response.ok || data?.success === false) {
        logger.error(`Failed to send Rasael OTP SMS to ${formattedTo} (input ${to}, status ${response.status}): ${JSON.stringify(data)}`);
        throw new SmsProviderError("delivery", "SMS delivery failed");
    }

    logger.info(`Rasael OTP SMS accepted for ${formattedTo}`);
};
