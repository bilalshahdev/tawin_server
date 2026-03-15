import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from "../config/constants";



const createToken = (user: any) => {
    return jwt.sign(
        { id: user._id, role: user.role, isVerified: user.isVerified },
        AUTH_CONSTANTS.JWT_ACCESS_SECRET,
        { expiresIn: AUTH_CONSTANTS.JWT_ACCESS_EXPIRY }
    );
};

export { createToken };