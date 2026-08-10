import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AUTH_CONSTANTS, STATUS_CODE } from "../../config/constants";
import { sendEmail } from "../../services/email.service";
import { isSmsConfigured, sendOtpSms } from "../../services/sms.service";
import { createStaffToken, createToken } from "../../services/jwt.service";
import { ApiError } from "../../utils/apiError";
import { User } from "../user/user.model";
import { logger } from "../../config/logger";
import {
  AuthResponse,
  AuthStaffResponse,
  ILoginDTO,
  IRegisterDTO,
  OtpLang,
} from "./auth.types";
import generateOTP from "../../utils/generateOtp";
import { Staff } from "../staff/staff.model";
import * as notificationService from "../notification/notification.service";
import { config } from "../../config/env.config";

const ensureSmsOtpConfigured = () => {
  if (
    config.smsService !== "true" ||
    !isSmsConfigured()
  ) {
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.sms_not_configured");
  }
};

const rollbackUser = async (userId: unknown) => {
  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    logger.error(`Failed to rollback user after registration delivery failure: ${error}`);
  }
};

const notifyAdminsSafely = async () => {
  try {
    await notificationService.notifyAdmins({
      title: "NOTIF_NEW_USER_TITLE",
      message: "NOTIF_NEW_USER_MSG",
      type: "auth",
    });
  } catch (error) {
    logger.warn(`Failed to notify admins for new user registration: ${error}`);
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

  const verificationChannel = data.phone ? "phone" : "email";
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

  try {
    if (verificationChannel === "phone" && user.phone) {
      ensureSmsOtpConfigured();
      await sendOtpSms(user.phone, otp, { email: user.email, lang: data.lang });
    } else if (user.email) {
      await sendEmail(
        user.email,
        "Verify Your Account",
        `Your OTP is: <b>${otp}</b>`,
      );
    } else {
      throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.validations.common.required");
    }
  } catch (error) {
    await rollbackUser(user._id);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      STATUS_CODE.BAD_REQUEST,
      verificationChannel === "phone" ? "errors.sms_delivery_failed" : "errors.email_delivery_failed",
    );
  }

  await notifyAdminsSafely();

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

export const forgotPassword = async (identifier: { email?: string; phone?: string; lang?: OtpLang }) => {
  const lookup = identifier.email ? { email: identifier.email } : { phone: identifier.phone };
  const user = await User.findOne(lookup);
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
  if (identifier.phone) {
    ensureSmsOtpConfigured();
  }

  const resetToken = identifier.phone ? generateOTP() : crypto.randomBytes(32).toString("hex");

  if (identifier.phone && user.phone) {
    await sendOtpSms(user.phone, resetToken, { email: user.email, lang: identifier.lang });
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    return;
  }

  if (!user.email) throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.email_required");

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
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();
};

export const resetPassword = async (
  token: string,
  newPass: string,
  identifier?: { email?: string; phone?: string },
) => {
  if (/^\d{6}$/.test(token) && !identifier?.email && !identifier?.phone) {
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.validations.common.required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const lookup = {
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
    ...(identifier?.email ? { email: identifier.email } : {}),
    ...(identifier?.phone ? { phone: identifier.phone } : {}),
  };
  const user = await User.findOne(lookup);

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

export const resendOtp = async (identifier: { email?: string; phone?: string; lang?: OtpLang }) => {
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

  if (user.verificationChannel === "phone" && user.phone) {
    ensureSmsOtpConfigured();
    await sendOtpSms(user.phone, newOtp, { email: user.email, lang: identifier.lang });
  } else if (user.email) {
    await sendEmail(
      user.email,
      "New Verification Code",
      `Your new code is: <b>${newOtp}</b>`,
    );
  } else {
    throw new ApiError(STATUS_CODE.BAD_REQUEST, "errors.validations.common.required");
  }

  user.verificationOtp = newOtp;
  user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationOtpLastSent = new Date();
  await user.save();
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new ApiError(STATUS_CODE.NOT_FOUND, "errors.user_not_found");
};
