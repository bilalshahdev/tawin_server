import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model';
import { ApiError } from '../../utils/apiError';
import { sendEmail } from '../../services/email.service';
import { AUTH_CONSTANTS } from '../../config/constants';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (data: any) => {
    const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (existing) throw new ApiError(400, "User already exists with this email or username");

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(data.password, AUTH_CONSTANTS.SALT_ROUNDS);

    const user = await User.create({
        ...data,
        password: hashedPassword,
        verificationOtp: otp,
        verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
        verificationOtpLastSent: new Date(),
    });

    await sendEmail(user.email, "Verify Your Account", `Your OTP is: <b>${otp}</b>`);
    return { email: user.email };
};

export const verifyOTP = async (email: string, otp: string) => {
    const user = await User.findOne({ email }).select('+verificationOtp +verificationOtpExpires');
    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "User already verified");
    if (user.verificationOtp !== otp) throw new ApiError(400, "Invalid OTP");
    if (new Date() > user.verificationOtpExpires!) throw new ApiError(400, "OTP expired");

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();
    return user;
};

export const login = async (data: any) => {
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new ApiError(401, "Invalid email or password");
    }
    if (!user.isVerified) throw new ApiError(403, "Please verify your email first");

    const token = jwt.sign({ id: user._id, role: user.role }, AUTH_CONSTANTS.JWT_ACCESS_SECRET, {
        expiresIn: AUTH_CONSTANTS.JWT_ACCESS_EXPIRY,
    });

    return { user, token };
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "No user found with that email");

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    // In production, this would be a URL to your frontend: https://yourapp.com/reset-password?token=...
    await sendEmail(user.email, "Password Reset Request", `Your reset token is: ${resetToken}`);
};

export const resetPassword = async (token: string, newPass: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Token is invalid or has expired");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
};

export const changePassword = async (userId: string, oldPass: string, newPass: string) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new ApiError(400, "Old password is incorrect");

    user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
    await user.save();
};

export const resendOTP = async (email: string) => {
    const user = await User.findOne({ email }).select('+verificationOtpLastSent +isVerified');

    if (!user) throw new ApiError(404, "User not found");
    if (user.isVerified) throw new ApiError(400, "User is already verified");

    // Cooldown logic: 2 minutes (120000ms)
    const COOLDOWN_TIME = 2 * 60 * 1000;
    const lastSent = user.verificationOtpLastSent?.getTime() || 0;
    const timePassed = Date.now() - lastSent;

    if (timePassed < COOLDOWN_TIME) {
        const secondsLeft = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
        throw new ApiError(400, `Please wait ${secondsLeft} seconds before requesting another OTP.`);
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationOtp = newOtp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.verificationOtpLastSent = new Date();
    await user.save();

    await sendEmail(
        user.email,
        "Your New Verification Code",
        `Your new OTP is: <b>${newOtp}</b>. It expires in 10 minutes.`
    );
};