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
        throw new Error("SMS authentication failed");
    }

    cachedAccessToken = data.result.accessToken;
    cachedAccessTokenExpiresAt = data.result.expireDate
        ? new Date(data.result.expireDate).getTime()
        : now + 10 * 60 * 1000;

    return cachedAccessToken;
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
        throw new Error("SMS service is not configured");
    }

    const email = options?.email || config.rasaelDefaultEmail;
    if (!email) {
        logger.warn("Rasael OTP request requires an email value. Set RASAEL_DEFAULT_EMAIL for phone-only users.");
        throw new Error("SMS recipient email is not configured");
    }

    const accessToken = await getRasaelAccessToken();
    const response = await fetch(config.rasaelSendUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requestId: crypto.randomUUID(),
            to,
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
        logger.error(`Failed to send Rasael OTP SMS to ${to}: ${JSON.stringify(data)}`);
        throw new Error("SMS delivery failed");
    }
};
