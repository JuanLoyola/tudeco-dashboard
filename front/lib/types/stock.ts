export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';

export interface StockMovement {
  id: number;
  type: MovementType;
  /** En ADJUSTMENT lleva signo; en ENTRY/EXIT siempre es positivo. */
  quantity: number;
  reason: string | null;
  productId: number;
  product: { id: number; name: string; sku: string };
  createdAt: string;
}

export interface CreateMovementInput {
  productId: number;
  type: MovementType;
  quantity: number;
  reason?: string;
}
