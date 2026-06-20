import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH_CONSTANTS, STATUS_CODE } from "../config/constants";
import { ApiError } from "../utils/apiError";
import { IPermission, Operation } from "../modules/staff/staff.types";

export const methodToOperation: Record<string, Operation> = {
    GET: 'get',
    POST: 'post',
    PATCH: 'patch',
    PUT: 'put',
    DELETE: 'delete'
};

export interface TokenPayload {
    id: string;
    role: string;
    isVerified?: boolean;
    isActive?: boolean;
    permissions?: IPermission[];
}

const modulePathAliases: Record<string, string[]> = {
    "coupon-codes": ["coupon", "coupons"],
    coupon: ["coupon", "coupons"],
    "financial-transfers": ["financial", "financials", "financial-stats"],
    financial: ["financial", "financials", "financial-stats"],
    brand: ["brand", "brands"],
    categories: ["category", "categories"],
    settings: ["settings"],
};

const hasModuleInPath = (moduleName: string, path: string) => {
    const normalizedModuleName = moduleName.toLowerCase().replace(/\s+/g, '-');
    const aliases = modulePathAliases[normalizedModuleName] || [normalizedModuleName];
    return aliases.some((alias) => path.includes(alias));
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.unauthorized")));
    }

    try {
        const decoded = jwt.verify(token, AUTH_CONSTANTS.JWT_ACCESS_SECRET) as TokenPayload;
        req.user = decoded;
        next();
    } catch {
        next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.invalid_token")));
    }
};

// export const authorize = (...roles: string[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (!req.user || !roles.includes(req.user.role)) {
//             return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
//         }
//         next();
//     };
// };

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as TokenPayload;

        if (!user) {
            return next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.unauthorized")));
        }

        // 1. Direct Role Match (Admins or Users hitting their own roles)
        if (roles.includes(user.role)) {
            return next();
        }

        // 2. Staff-to-Admin Permission Bridge
        // If the route requires 'admin' and the user is 'staff', we check permissions
        if (roles.includes('admin') && user.role === 'staff' && user.permissions) {
            const currentPath = req.originalUrl.toLowerCase();
            const requiredOperation = methodToOperation[req.method];

            if (!requiredOperation) return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));

            /**
             * Automated Module Discovery:
             * We find if any of the staff's allowed modules are present in the URL path.
             */
            const modulePermission = user.permissions.find(p => {
                return hasModuleInPath(p.module, currentPath);
            });

            if (modulePermission && modulePermission.operations.includes(requiredOperation)) {
                return next();
            }
        }

        // 3. Fallback: Access Denied
        return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
    };
};
