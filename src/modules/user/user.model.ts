import { Schema, model } from 'mongoose';
import { IUser } from './user.types';

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    isVerified: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
    phone: { type: String }, // Made optional for registration
    profileImage: { type: String, default: 'default-avatar.png' },
    country: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    lastLogout: { type: Date },

    // OTP Fields
    verificationOtp: { type: String, select: false },
    verificationOtpExpires: { type: Date, select: false },
    verificationOtpLastSent: { type: Date, select: false },

    // Password Reset Fields
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    constructionBasket: {
        isApplied: { type: Boolean, default: false },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        fullRegistrationName: String,
        phoneNumber: String,
        monthlyIncome: Number,
        occupation: String,
        unifiedCard: String,
        residenceCard: String,
        propertyArea: String,
        propertyType: { type: String, enum: ['Freehold', 'Leasehold'] },
        country: String
    }
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);