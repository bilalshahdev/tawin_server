import { config } from "../config/env.config";
import { logger } from "../config/logger";

export const sendSms = async (to: string, message: string) => {
    if (config.smsService !== "true") {
        logger.info(`SMS service disabled. Skipping SMS to ${to}.`);
        return;
    }

    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioFromNumber) {
        logger.warn("SMS service is enabled, but Twilio credentials are incomplete.");
        return;
    }

    const body = new URLSearchParams({
        To: to,
        From: config.twilioFromNumber,
        Body: message,
    });

    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Failed to send SMS to ${to}: ${errorText}`);
        throw new Error("SMS delivery failed");
    }
};
