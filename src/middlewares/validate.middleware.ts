import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { normalizeZodError, translateError } from "../utils/normalizeZodError";

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
          const normalized = normalizeZodError(error.issues);

          const errors = normalized.map((err) =>
            translateError(req, err)
          );

          return res.status(400).json({
            status: "error",
            message: req.t("errors.validations.failed"),
            errors,
          });
        }

        next(error);
      }
    };