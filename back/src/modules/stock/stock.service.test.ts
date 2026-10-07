import type { Product } from '@prisma/client';
import { BusinessRuleError, NotFoundError } from '../../shared/errors';
import { StockService } from './stock.service';
import type { ApplyMovementInput, StockRepository } from './stock.repository';
import type { ProductRepository } from '../products/product.repository';
import type { MovementDTO } from './stock.types';

let movementId = 1;

function fakeStockRepository(): StockRepository & { calls: ApplyMovementInput[] } {
  const calls: ApplyMovementInput[] = [];
  return {
    calls,
    applyMovement: async (input) => {
      calls.push(input);
      return {
        id: movementId++,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason ?? null,
        productId: input.productId,
        product: { id: input.productId, name: 'Lámpara', sku: 'LMP-001' },
        createdAt: new Date(),
      };
    },
    listMovements: async () => ({ rows: [], total: 0 }),
  };
}

function fakeProductRepository(stock: number): ProductRepository {
  const now = new Date();
  const product: Product = {
    id: 1,
    sku: 'LMP-001',
    name: 'Lámpara Aurora',
    description: null,
    price: 15000 as unknown as Product['price'],
    cost: null,
    stock,
    minStock: 2,
    isActive: true,
    categoryId: null,
    createdAt: now,
    updatedAt: now,
  };

  return {
    findPage: async () => ({ rows: [{ ...product, category: null }], total: 1 }),
    findById: async (id) => (id === product.id ? { ...product, category: null } : null),
    findBySku: async () => null,
    countMovements: async () => 0,
    hasMovements: async () => false,
    create: async () => ({ ...product, category: null }),
    update: async () => ({ ...product, category: null }),
    remove: async () => undefined,
  };
}

describe('StockService', () => {
  it('una entrada suma stock', async () => {
    const stock = fakeStockRepository();
    const service = new StockService(stock, fakeProductRepository(10));

    await service.register({ productId: 1, type: 'ENTRY', quantity: 5 });

    expect(stock.calls[0].delta).toBe(5);
  });

  it('una salida resta stock', async () => {
    const stock = fakeStockRepository();
    const service = new StockService(stock, fakeProductRepository(10));

    await service.register({ productId: 1, type: 'EXIT', quantity: 3 });

    expect(stock.calls[0].delta).toBe(-3);
  });

  it('una corrección aplica el signo propio del valor', async () => {
    const stock = fakeStockRepository();
    const service = new StockService(stock, fakeProductRepository(10));

    await service.register({ productId: 1, type: 'ADJUSTMENT', quantity: -4 });

    expect(stock.calls[0].delta).toBe(-4);
  });

  it('no permite salir más unidades de las disponibles', async () => {
    const service = new StockService(fakeStockRepository(), fakeProductRepository(4));

    await expect(
      service.register({ productId: 1, type: 'EXIT', quantity: 10 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('no registra nada si el producto no existe', async () => {
    const stock = fakeStockRepository();
    const service = new StockService(stock, fakeProductRepository(10));

    await expect(
      service.register({ productId: 999, type: 'ENTRY', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(stock.calls).toHaveLength(0);
  });

  it('interpreta la carrera de concurrencia como error de negocio', async () => {
    const stock: StockRepository = {
      applyMovement: async () => null,
      listMovements: async () => ({ rows: [], total: 0 }),
    };
    const service = new StockService(stock, fakeProductRepository(10));

    await expect(
      service.register({ productId: 1, type: 'EXIT', quantity: 1 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('devuelve el movimiento con el producto resumido', async () => {
    const service = new StockService(fakeStockRepository(), fakeProductRepository(10));

    const movement: MovementDTO = await service.register({
      productId: 1,
      type: 'ENTRY',
      quantity: 2,
      reason: 'Proveedor',
    });

    expect(movement).toMatchObject({ type: 'ENTRY', quantity: 2, product: { sku: 'LMP-001' } });
  });
});
