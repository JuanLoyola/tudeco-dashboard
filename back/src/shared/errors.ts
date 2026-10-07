/**
 * Errores de aplicación: llevan un código HTTP y un código interno estable
 * para que el front (y los tests) puedan ramapear sin parsear mensajes.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 404: el recurso no existe. */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: number | string) {
    super(
      id === undefined ? `${resource} no encontrado` : `${resource} ${id} no encontrado`,
      404,
      'NOT_FOUND',
    );
  }
}

/** 409: la operación choca con un estado existente (SKU repetido, etc.). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 422: la petición es sintácticamente válida pero viola una regla de negocio. */
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION');
  }
}
