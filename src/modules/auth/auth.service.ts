import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AUTH_CONSTANTS, STATUS_CODE } from '../../config/constants';
import { sendEmail } from '../../services/email.service';
import { createToken } from '../../services/jwt.service';
import { ApiError } from '../../utils/apiError';
import { User } from '../user/user.model';
import { AuthResponse, ILoginDTO, IRegisterDTO } from './auth.types';

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const testLogin = async () => {
    const adminEmail = "bilalshah.dev@gmail.com";
    const user = await User.findOne({ email: adminEmail });
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    const token = createToken(user);
    return { user, token };
};

export const register = async (data: IRegisterDTO): Promise<AuthResponse> => {
    const existing = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }]
    });

    if (existing) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.user_exists");

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(data.password!, AUTH_CONSTANTS.SALT_ROUNDS);

    const user = await User.create({
        ...data,
        password: hashedPassword,
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
        verificationOtpLastSent: new Date()
    });

    await sendEmail(user.email, "Verify Your Account", `Your OTP is: <b>${otp}</b>`);
    const token = createToken(user);
    return { user, token };
};

export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
    const user = await User.findOne({ email }).select('+verificationOtp +verificationOtpExpires');

    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    if (user.isVerified) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_verified");
    if (user.verificationOtp !== otp) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.otp_invalid");
    if (new Date() > user.verificationOtpExpires!) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.otp_expired");

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    const token = createToken(user);
    return { user, token };
};

export const login = async (data: ILoginDTO): Promise<AuthResponse> => {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user || !(await bcrypt.compare(data.password!, user.password!))) {
        throw new ApiError(STATUS_CODE.UNAUTHORIZED, "errors.invalid_credentials");
    }

    const token = createToken(user);

    return { user, token };
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

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

    if (!user) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.token_invalid");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
};

export const changePassword = async (userId: string, oldPass: string, newPass: string) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, "errors.user_not_found");

    const isMatch = await bcrypt.compare(oldPass, user.password!);
    if (!isMatch) throw new ApiError(400, "errors.old_password_incorrect");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    await user.save();
};

export const changeEmail = async (userId: string, newEmail: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.email_exists");
    const otp = generateOTP();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendEmail(user.email, "Verify Your Account", `Your OTP is: <b>${otp}</b>`);
    const token = createToken(user);
    return { user, token };
};

export const resendOTP = async (email: string) => {
    const user = await User.findOne({ email }).select('+verificationOtpLastSent +isVerified');

    if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
    if (user.isVerified) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_verified");

    const COOLDOWN = 2 * 60 * 1000;
    const timePassed = Date.now() - (user.verificationOtpLastSent?.getTime() || 0);

    if (timePassed < COOLDOWN) {
        const secondsLeft = Math.ceil((COOLDOWN - timePassed) / 1000);
        throw new ApiError(STATUS_CODE.BAD_REQUEST, `errors.otp_cooldown`);
    }

    const newOtp = generateOTP();
    user.verificationOtp = newOtp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationOtpLastSent = new Date();
    await user.save();

    await sendEmail(user.email, "New Verification Code", `Your new code is: <b>${newOtp}</b>`);
};