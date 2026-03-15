import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          // Use .issues for the most accurate error mapping
          const errorMessages = error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }));

          return res.status(400).json({
            status: "error",
            message: "Validation Failed",
            errors: errorMessages,
          });
        }
        next(error);
      }
    };