import type { Category } from './category';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  /** Siempre coincide con la suma de su historial de movimientos. */
  stock: number;
  minStock: number;
  isActive: boolean;
  categoryId: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  stock?: number;
  minStock?: number;
  isActive?: boolean;
  categoryId?: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
