import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = decoded;

        next();

    } catch {
        next(new ApiError(401, "Invalid token"));
    }
};