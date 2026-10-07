import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

/**
 * Valida `req.body` con el schema de la ruta. Si falla, delega el error
 * al errorHandler (que sabe traducir ZodError a un 400).
 */
export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
