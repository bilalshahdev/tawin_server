import { Request } from "express";
import { IPermission } from "../modules/staff/staff.types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        isVerified?: boolean;
        isActive?: boolean;
        permissions?: IPermission[];
      };
      uploadedFiles?: string[];
    }
  }
}

export {};