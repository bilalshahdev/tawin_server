import { Document } from 'mongoose';

export type UserRole = 'admin' | 'customer';

export type PropertyType = 'Freehold' | 'Leasehold';

export type ConstructionBasketStatus = 'pending' | 'approved' | 'rejected';

export interface IConstructionBasket {
  isApplied: boolean;
  status: ConstructionBasketStatus;
  fullRegistrationName?: string;
  phoneNumber?: string;
  monthlyIncome?: number;
  occupation?: string;
  unifiedCard?: string;
  residenceCard?: string;
  propertyArea?: string;
  propertyType?: PropertyType;
  country?: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isVerified: boolean;
  password: string;
  phone: string;
  profileImage: string;
  country: string;
  role: UserRole;

  verificationOtp?: string;
  verificationOtpExpires?: Date;
  verificationOtpLastSent?: Date;

  lastLogout?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  constructionBasket: IConstructionBasket;

  createdAt: Date;
  updatedAt: Date;
}