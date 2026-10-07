import { ApiError } from './api';

/** Formatea montos en pesos argentinos (sin decimales). */
export const money = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Mensaje mostrable de un error desconocido: si vino de la API usa el suyo
 * (`{ error: { message } }`), si no, uno genérico.
 */
export const errorMessage = (cause: unknown): string =>
  cause instanceof ApiError ? cause.message : 'Error desconocido';
