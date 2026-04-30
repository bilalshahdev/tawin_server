

import { methodToOperation, TokenPayload } from "./auth.middleware";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { STATUS_CODE } from "../config/constants";

export const checkPermission = (moduleName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as TokenPayload;

        if (!user) {
            return next(new ApiError(STATUS_CODE.UNAUTHORIZED, req.t("auth.unauthorized")));
        }
        if (user.role === 'admin') return next();

        if (user.role === 'staff' && user.permissions) {
            const requiredOperation = methodToOperation[req.method];
            if (!requiredOperation) {
                return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
            }
            const modulePermission = user.permissions.find(p => (p.module as any) === moduleName);

            if (modulePermission && modulePermission.operations.includes(requiredOperation)) {
                return next();
            }
        }

        return next(new ApiError(STATUS_CODE.FORBIDDEN, req.t("auth.forbidden")));
    };
};