import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AUTH_CONSTANTS, STATUS_CODE } from "../../config/constants";
import { sendEmail } from "../../services/email.service";
import { sendSms } from "../../services/sms.service";
import { createStaffToken, createToken } from "../../services/jwt.service";
import { ApiError } from "../../utils/apiError";
import { User } from "../user/user.model";
import {
  AuthResponse,
  AuthStaffResponse,
  ILoginDTO,
  IRegisterDTO,
} from "./auth.types";
import generateOTP from "../../utils/generateOtp";
import { Staff } from "../staff/staff.model";
import * as notificationService from "../notification/notification.service";
import { config } from "../../config/env.config";

const ensureSmsOtpConfigured = () => {
  if (
    config.smsService !== "true" ||
    !config.twilioAccountSid ||
    !config.twilioAuthToken ||
    !config.twilioFromNumber
  ) {
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.sms_not_configured");
  }
};

export const register = async (
  data: IRegisterDTO,
  isAdminRequest: boolean = false,
): Promise<AuthResponse> => {
  const uniquenessChecks = [
    { username: data.username },
    ...(data.email ? [{ email: data.email }] : []),
    ...(data.phone ? [{ phone: data.phone }] : []),
  ];

  const existing = await User.findOne({ $or: uniquenessChecks });

  if (existing)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.user_exists");
  const hashedPassword = await bcrypt.hash(
    data.password!,
    AUTH_CONSTANTS.SALT_ROUNDS,
  );

  if (isAdminRequest) {
    const user = await User.create({
      ...data,
      password: hashedPassword,
      isVerified: true,
    });

    const token = createToken(user);
    return { user, token };
  }

  const otp = generateOTP();

  const verificationChannel = data.phone && !data.email ? "phone" : "email";
  if (verificationChannel === "phone") {
    ensureSmsOtpConfigured();
  }

  const user = await User.create({
    ...data,
    password: hashedPassword,
    isVerified: false,
    verificationChannel,
    verificationOtp: otp,
    verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    verificationOtpLastSent: new Date(),
  });

  await notificationService.notifyAdmins({
    title: "NOTIF_NEW_USER_TITLE",
    message: "NOTIF_NEW_USER_MSG",
    type: "auth",
  });

  if (verificationChannel === "phone" && user.phone) {
    ensureSmsOtpConfigured();
    await sendSms(user.phone, `Your Tawin verification OTP is: ${otp}`);
  } else if (user.email) {
    await sendEmail(
      user.email,
      "Verify Your Account",
      `Your OTP is: <b>${otp}</b>`,
    );
  }
  const token = createToken(user);
  return { user, token };
};

export const verifyOtp = async (
  identifier: { email?: string; phone?: string },
  otp: string,
): Promise<AuthResponse> => {
  const lookup = identifier.email ? { email: identifier.email } : { phone: identifier.phone };
  const user = await User.findOne(lookup).select(
    "+verificationOtp +verificationOtpExpires",
  );

  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
  if (user.isVerified)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_verified");
  if (user.verificationOtp !== otp)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.otp_invalid");
  if (new Date() > user.verificationOtpExpires!)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.otp_expired");

  user.isVerified = true;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  const token = createToken(user);
  return { user, token };
};

export const login = async (data: ILoginDTO): Promise<AuthResponse> => {
  const lookup = data.email ? { email: data.email } : { phone: data.phone };
  const user = await User.findOne(lookup).select("+password");

  if (!user || !(await bcrypt.compare(data.password!, user.password!))) {
    throw new ApiError(STATUS_CODE.UNAUTHORIZED, "errors.invalid_credentials");
  }

  const token = createToken(user);
  return { user, token };
};

export const testLogin = async (): Promise<AuthResponse> => {
  const user = await User.findOne({ role: "admin" }).select("+password");

  if (!user) {
    throw new ApiError(STATUS_CODE.UNAUTHORIZED, "errors.invalid_credentials");
  }

  const token = createToken(user);
  return { user, token };
};

export const staffLogin = async (
  data: ILoginDTO,
): Promise<AuthStaffResponse> => {
  const staff = await Staff.findOne({ email: data.email }).select("+password");
  if (!staff || !(await bcrypt.compare(data.password!, staff.password!))) {
    throw new ApiError(STATUS_CODE.UNAUTHORIZED, "errors.invalid_credentials");
  }
  if (!staff.isActive) {
    throw new ApiError(STATUS_CODE.FORBIDDEN, "errors.account_deactivated");
  }
  const token = createStaffToken(staff);

  return { user: staff, token };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
  if (!user.email) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.email_required");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const frontendBaseUrl = config.frontendUrl || "http://localhost:3000";
  const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${resetToken}`;

  const emailSubject = "Password Reset Request";
  const emailMessage = `
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you cannot click the link, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 30 minutes.</p>
    `;

  await sendEmail(user.email, emailSubject, emailMessage);
};

export const resetPassword = async (token: string, newPass: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.token_invalid");

  user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

export const changePassword = async (
  userId: string,
  oldPass: string,
  newPass: string,
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

  const isMatch = await bcrypt.compare(oldPass, user.password!);
  if (!isMatch)
    throw new ApiError(
      STATUS_CODE.BAD_REQUEST,
      "errors.old_password_incorrect",
    );

  user.password = await bcrypt.hash(newPass, AUTH_CONSTANTS.SALT_ROUNDS);
  await user.save();
};

export const changeEmail = async (userId: string, newEmail: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");

  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.email_exists");

  const otp = generateOTP();
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail(
    newEmail,
    "Verify Your New Email",
    `Your OTP is: <b>${otp}</b>`,
  );
  const token = createToken(user);
  return { user, token };
};

export const resendOtp = async (identifier: { email?: string; phone?: string }) => {
  const lookup = identifier.email ? { email: identifier.email } : { phone: identifier.phone };
  const user = await User.findOne(lookup).select(
    "+verificationOtpLastSent +isVerified +verificationChannel",
  );

  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
  if (user.isVerified)
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.already_verified");

  const COOLDOWN = 2 * 60 * 1000;
  const timePassed =
    Date.now() - (user.verificationOtpLastSent?.getTime() || 0);

  if (timePassed < COOLDOWN) {
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.otp_cooldown");
  }

  if (user.verificationChannel === "phone" && user.phone) {
    ensureSmsOtpConfigured();
  }

  const newOtp = generateOTP();
  user.verificationOtp = newOtp;
  user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationOtpLastSent = new Date();
  await user.save();

  if (user.verificationChannel === "phone" && user.phone) {
    ensureSmsOtpConfigured();
    await sendSms(user.phone, `Your new Tawin verification OTP is: ${newOtp}`);
  } else if (user.email) {
    await sendEmail(
      user.email,
      "New Verification Code",
      `Your new code is: <b>${newOtp}</b>`,
    );
  }
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
};
