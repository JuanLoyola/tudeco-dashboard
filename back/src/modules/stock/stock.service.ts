import { BusinessRuleError, NotFoundError } from '../../shared/errors';
import type { ProductRepository } from '../products/product.repository';
import type { CreateMovementInput, ListMovementsQuery } from './stock.schemas';
import type { StockRepository } from './stock.repository';
import { toMovementDTO, type MovementDTO, type PaginationMeta } from './stock.types';

/**
 * Reglas de stock. El service decide QUÉ pasa; el repository decide CÓMO
 * se persiste (incluida la transacción que hace el update atómico).
 */
export class StockService {
  constructor(
    private readonly stock: StockRepository,
    private readonly products: ProductRepository,
  ) {}

  async register(input: CreateMovementInput): Promise<MovementDTO> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new NotFoundError('Producto', input.productId);

    const delta = this.deltaFor(input.type, input.quantity);

    if (product.stock + delta < 0) {
      throw new BusinessRuleError(
        `Stock insuficiente para "${product.name}": hay ${product.stock} y el movimiento quita ${-delta}`,
      );
    }

    const movement = await this.stock.applyMovement({
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      delta,
    });

    if (!movement) {
      throw new BusinessRuleError('El stock cambió mientras se registraba el movimiento');
    }

    return toMovementDTO(movement);
  }

  async list(query: ListMovementsQuery): Promise<{ data: MovementDTO[]; meta: PaginationMeta }> {
    const { rows, total } = await this.stock.listMovements(query);

    return {
      data: rows.map(toMovementDTO),
      meta: {
        page: query.page,
        take: query.take,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.take)),
      },
    };
  }

  /**
   * ENTRY     → +cantidad
   * EXIT      → -cantidad
   * ADJUSTMENT→ cantidad con signo (corrección de inventario, merma, etc.)
   */
  private deltaFor(type: CreateMovementInput['type'], quantity: number): number {
    if (type === 'ENTRY') return quantity;
    if (type === 'EXIT') return -quantity;
    return quantity;
  }
}
