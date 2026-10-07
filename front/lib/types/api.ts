/** Contrato genérico del HTTP: paginación y errores por campo. */

export interface PaginationMeta {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Detalle de una validación: `{ field, message }` por input inválido. */
export interface ApiErrorDetail {
  field: string;
  message: string;
}
