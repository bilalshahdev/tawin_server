import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        isVerified: boolean;
      };
      uploadedFiles?: string[];
    }
  }
}

export {};