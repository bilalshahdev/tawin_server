import { IStaff } from "../staff/staff.types";
import { IUser } from "../user/user.types";

export interface IRegisterDTO extends Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email' | 'phone' | 'password' | 'country'> { }

export interface ILoginDTO extends Pick<IUser, 'email' | 'phone' | 'password'> { }

export interface AuthResponse {
    user: IUser;
    token: string;
}
export interface AuthStaffResponse {
    user: IStaff;
    token: string;
}

