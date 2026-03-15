import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { ApiError } from '../../utils/apiError';
import { sendEmail } from '../../services/email.service';
import { AUTH_CONSTANTS } from '../../config/constants';
import { IRegisterDTO, ILoginDTO, AuthResponse } from './auth.types';
import { createToken } from '../../services/jwt.service';

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (data: IRegisterDTO): Promise<AuthResponse> => {
    const existing = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }]
    });

    if (existing) throw new ApiError(400, "errors.user_exists");

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(data.password, AUTH_CONSTANTS.SALT_ROUNDS);

    // FIX 1: Save the OTP and Expiry during creation
    const user = await User.create({
        ...data,
        password: hashedPassword,
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        verificationOtpLastSent: new Date()
    });

    await sendEmail(user.email, "Verify Your Account", `Your OTP is: <b>${otp}</b>`);

    // FIX 2: Return token so they are logged in (but restricted)
    const token = createToken(user);
    return { user, token };
};

export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
    const user = await User.findOne({ email }).select('+verificationOtp +verificationOtpExpires');

    if (!user) throw new ApiError(404, "errors.user_not_found");
    if (user.isVerified) throw new ApiError(400, "errors.already_verified");
    if (user.verificationOtp !== otp) throw new ApiError(400, "errors.otp_invalid");
    if (new Date() > user.verificationOtpExpires!) throw new ApiError(400, "errors.otp_expired");

    user.isVerified = true;
    user.verificationOtp = undefined; // Clear OTP after use
    user.verificationOtpExpires = undefined;
    await user.save();

    // FIX 3: Return a NEW token with updated isVerified: true status
    const token = createToken(user);
    return { user, token };
};

export const login = async (data: ILoginDTO): Promise<AuthResponse> => {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new ApiError(401, "errors.invalid_credentials");
    }

    const token = createToken(user);

    return { user, token };
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "errors.user_not_found");

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    await sendEmail(user.email, "Password Reset", `Your reset token is: ${resetToken}`);
};

export const resetPassword = async (token: string, newPass: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
    });

    if (!user) throw new ApiError(400, "errors.token_invalid");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
};

export const changePassword = async (userId: string, oldPass: string, newPass: string) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, "errors.user_not_found");

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new ApiError(400, "errors.old_password_incorrect");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    await user.save();
};

export const resendOTP = async (email: string) => {
    const user = await User.findOne({ email }).select('+verificationOtpLastSent +isVerified');

    if (!user) throw new ApiError(404, "errors.user_not_found");
    if (user.isVerified) throw new ApiError(400, "errors.already_verified");

    const COOLDOWN = 2 * 60 * 1000;
    const timePassed = Date.now() - (user.verificationOtpLastSent?.getTime() || 0);

    if (timePassed < COOLDOWN) {
        const secondsLeft = Math.ceil((COOLDOWN - timePassed) / 1000);
        throw new ApiError(400, `errors.otp_cooldown`);
    }

    const newOtp = generateOTP();
    user.verificationOtp = newOtp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationOtpLastSent = new Date();
    await user.save();

    await sendEmail(user.email, "New Verification Code", `Your new code is: <b>${newOtp}</b>`);
};