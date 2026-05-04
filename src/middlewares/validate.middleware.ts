import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { normalizeZodError, translateError } from "../utils/normalizeZodError";

export const validate =
  (schema: z.ZodTypeAny) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Replace req.body with the parsed (and stripped/coerced) version so
        // controllers see only schema-defined fields. Skip query/params: in modern
        // Express they are getter-only and assigning would throw.
        if (parsed && typeof parsed === "object" && "body" in parsed) {
          req.body = (parsed as { body: unknown }).body;
        }

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
