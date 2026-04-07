// src/utils/generateOtp.ts
import crypto from 'crypto';

const generateOTP = (): string => {
    return crypto.randomInt(100000, 1000000).toString();
};

export default generateOTP;