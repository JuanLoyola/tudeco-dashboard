import {
  type ApiErrorDetail,
  type Category,
  type CreateMovementInput,
  type CreateProductInput,
  type DashboardSummary,
  type ListResponse,
  type Product,
  type StockMovement,
  type UpdateProductInput,
} from './types';

/** Base URL de la API, se puede pisar con `NEXT_PUBLIC_API_URL`. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/**
 * Error de la API: conserva status, code y el detalle por campo que manda
 * el backend, para poder pintarlo debajo del input que falló.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Mensaje de un campo concreto, si el backend devolvió uno. */
  fieldError(field: string): string | undefined {
    return this.details.find((detail) => detail.field === field)?.message;
  }

  /** Errores que no apuntan a un campo (reglas de negocio, validación raíz). */
  generalMessages(): string[] {
    const unscoped = this.details.filter((detail) => !detail.field).map((detail) => detail.message);
    return unscoped.length > 0 ? unscoped : [this.message];
  }
}

/** Llamada cruda: devuelve el body completo (`{ data }` o `{ error }`). */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      body?.error?.message ?? `La API respondió ${response.status} en ${path}`,
      response.status,
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.details ?? [],
    );
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** `GET` que desenvuelve `data`. */
export async function apiGet<T>(path: string): Promise<T> {
  const body = await request<{ data: T }>(path);
  return body.data;
}

/** Escritura (POST/PATCH/DELETE) que desenvuelve `data`. */
async function apiSend<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', data?: unknown) {
  const body = await request<{ data?: T }>(path, {
    method,
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return body?.data as T;
}

/* ------------------------------- lectura ------------------------------- */

export const getDashboardSummary = () => apiGet<DashboardSummary>('/dashboard/summary');

export const getProducts = (take = 50) => request<ListResponse<Product>>(`/products?take=${take}`);

export const getCategories = () => apiGet<Category[]>('/categories');

export const getMovements = (productId: number, take = 20) =>
  request<ListResponse<StockMovement>>(`/stock/movements?productId=${productId}&take=${take}`);

/* ------------------------------ escritura ------------------------------ */

export const createProduct = (input: CreateProductInput) =>
  apiSend<Product>('/products', 'POST', input);

export const updateProduct = (id: number, input: UpdateProductInput) =>
  apiSend<Product>(`/products/${id}`, 'PATCH', input);

export const deleteProduct = (id: number) => apiSend<void>(`/products/${id}`, 'DELETE');

export const createMovement = (input: CreateMovementInput) =>
  apiSend<StockMovement>('/stock/movements', 'POST', input);
