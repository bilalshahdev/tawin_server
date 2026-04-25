import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from "../config/constants";
import { IStaff } from '../modules/staff/staff.types';
import { IUser } from '../modules/user/user.types';



const createToken = (user: IUser) => {
    return jwt.sign(
        { id: user._id, role: user.role, isVerified: user.isVerified },
        AUTH_CONSTANTS.JWT_ACCESS_SECRET,
        { expiresIn: AUTH_CONSTANTS.JWT_ACCESS_EXPIRY }
    );
};

const createStaffToken = (user: IStaff) => {
    return jwt.sign(
        { id: user._id, role: user.role, isActive: user.isActive },
        AUTH_CONSTANTS.JWT_ACCESS_SECRET,
        { expiresIn: AUTH_CONSTANTS.JWT_ACCESS_EXPIRY }
    );
};

export { createToken, createStaffToken };