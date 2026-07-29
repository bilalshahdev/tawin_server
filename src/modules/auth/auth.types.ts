import { IStaff } from "../staff/staff.types";
import { IUser } from "../user/user.types";

export type OtpLang = 'en' | 'ar' | 'ku';

export interface IRegisterDTO extends Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email' | 'phone' | 'password' | 'country'> {
    lang?: OtpLang;
}

export interface ILoginDTO extends Pick<IUser, 'email' | 'phone' | 'password'> { }

export interface AuthResponse {
    user: IUser;
    token: string;
}
export interface AuthStaffResponse {
    user: IStaff;
    token: string;
}

