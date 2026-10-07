import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors';

/** Cualquier ruta que no matchee termina en un 404 con formato estándar. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.path}`));
};
