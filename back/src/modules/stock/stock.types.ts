import type { MovementType, Product } from '@prisma/client';

export interface MovementDTO {
  id: number;
  type: MovementType;
  quantity: number;
  reason: string | null;
  productId: number;
  product: { id: number; name: string; sku: string };
  createdAt: Date;
}

export interface PaginationMeta {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

type MovementWithMinimalProduct = {
  id: number;
  type: MovementType;
  quantity: number;
  reason: string | null;
  productId: number;
  product: Pick<Product, 'id' | 'name' | 'sku'>;
  createdAt: Date;
};

export function toMovementDTO(movement: MovementWithMinimalProduct): MovementDTO {
  return {
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    productId: movement.productId,
    product: {
      id: movement.product.id,
      name: movement.product.name,
      sku: movement.product.sku,
    },
    createdAt: movement.createdAt,
  };
}
