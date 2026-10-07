import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors';

/**
 * Único lugar donde se transforma un error en una respuesta HTTP.
 * El orden importa: primero los tipos que sabemos interpretar, después el genérico.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. Validación de entrada (Zod)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  // 2. Errores de dominio (nuestros)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // 3. Errores conocidos de Prisma → HTTP con mensaje amigable
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // restricción única
        res.status(409).json({
          error: { code: 'CONFLICT', message: 'Ya existe un registro con ese valor único' },
        });
        return;
      case 'P2025': // registro a modificar no encontrado
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'El registro no existe' },
        });
        return;
      case 'P2003': // foreign key
        res.status(409).json({
          error: { code: 'CONFLICT', message: 'Operación referida a un registro inexistente' },
        });
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      error: { code: 'INVALID_QUERY', message: 'Consulta inválida contra la base de datos' },
    });
    return;
  }

  // 4. Todo lo demás es un 500: nunca filtrar el detalle al cliente
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
};
