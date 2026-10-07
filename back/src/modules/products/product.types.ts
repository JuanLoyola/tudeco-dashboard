import type { Category, Product } from '@prisma/client';

export type ProductWithCategory = Product & { category: Category | null };

/**
 * Lo que sale por la API. Los `Decimal` de Prisma viajan como número:
 * el mapeo vive acá, no en el controller ni en el front.
 */
export interface ProductDTO {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  categoryId: number | null;
  category: { id: number; name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

export function toProductDTO(product: ProductWithCategory): ProductDTO {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    cost: product.cost === null ? null : Number(product.cost),
    stock: product.stock,
    minStock: product.minStock,
    isActive: product.isActive,
    categoryId: product.categoryId,
    category: product.category
      ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
