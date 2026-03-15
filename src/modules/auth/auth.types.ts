import { IUser } from "../user/user.types";

export interface IRegisterDTO extends Pick<IUser, 'firstName' | 'lastName' | 'username' | 'email' | 'password' | 'country'> { }

export interface ILoginDTO extends Pick<IUser, 'email' | 'password'> { }

export interface AuthResponse {
    user: IUser;
    token: string;
}