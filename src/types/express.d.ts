import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

// Define a custom interface for the request
export interface AuthRequest extends Request {
    user?: any; // You can change 'any' to your specific IUser type if preferred
}

export const authMiddleware = (
    req: AuthRequest, // Use AuthRequest here
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded; // Now this will work!
        next();
    } catch {
        next(new ApiError(401, "Invalid token"));
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !roles.includes(user.role)) {
            return next(new ApiError(403, "Forbidden: You do not have permission"));
        }
        next();
    };
};