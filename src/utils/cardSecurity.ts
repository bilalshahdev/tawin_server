import crypto from "crypto";
import { config } from "../config/env.config";

const getCardSecret = () =>
    crypto
        .createHash("sha256")
        .update(config.cardEncryptionKey || config.jwtSecret)
        .digest();

export const normalizeCardNumber = (cardNumber: string) => cardNumber.replace(/\D/g, "");

export const encryptCardNumber = (cardNumber: string) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", getCardSecret(), iv);
    const encrypted = Buffer.concat([
        cipher.update(cardNumber, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const hashCardNumber = (cardNumber: string) =>
    crypto
        .createHmac("sha256", getCardSecret())
        .update(cardNumber)
        .digest("hex");

export const secureCardNumber = (cardNumber: string) => {
    const normalized = normalizeCardNumber(cardNumber);

    return {
        masterCardLast4: normalized.slice(-4),
        masterCardHash: hashCardNumber(normalized),
        masterCardEncrypted: encryptCardNumber(normalized),
    };
};
