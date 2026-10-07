import type { MovementType, PrismaClient, Product, StockMovement } from '@prisma/client';
import type { ListMovementsQuery } from './stock.schemas';

export type MovementWithProduct = StockMovement & {
  product: Pick<Product, 'id' | 'name' | 'sku'>;
};

export interface ApplyMovementInput {
  productId: number;
  type: MovementType;
  quantity: number;
  reason?: string;
  /** Signo a aplicar sobre `Product.stock`: +10, -3, -5... */
  delta: number;
}

export interface MovementPage {
  rows: MovementWithProduct[];
  total: number;
}

export interface StockRepository {
  /**
   * Aplica el movimiento de forma atómica.
   * Devuelve `null` si no se pudo (el stock quedó insuficiente entre el
   * chequeo del service y la escritura).
   */
  applyMovement(input: ApplyMovementInput): Promise<MovementWithProduct | null>;
  listMovements(query: ListMovementsQuery): Promise<MovementPage>;
}

export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async applyMovement(input: ApplyMovementInput): Promise<MovementWithProduct | null> {
    return this.prisma.$transaction(async (tx) => {
      // updateMany con condición = guarda de concurrencia. Si nadie pudo
      // aplicar el movimiento, el stock no alcanzaba (o el producto no existe).
      const applied = await tx.product.updateMany({
        where: {
          id: input.productId,
          ...(input.delta < 0 ? { stock: { gte: -input.delta } } : {}),
        },
        data: { stock: { increment: input.delta } },
      });

      if (applied.count === 0) return null;

      return tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          reason: input.reason,
        },
        include: { product: true },
      });
    });
  }

  async listMovements(query: ListMovementsQuery): Promise<MovementPage> {
    const where = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.take,
        take: query.take,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { rows, total };
  }
}
