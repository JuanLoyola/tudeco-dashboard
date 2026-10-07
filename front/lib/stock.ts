import { createMovement, createProduct } from './api';
import type { CreateProductInput, Product, UpdateProductInput } from './types';

/**
 * Alta de producto con stock inicial.
 *
 * El producto nace SIEMPRE con stock 0 y, si hay unidades iniciales, se
 * registra un movimiento ENTRY. Así `Product.stock` siempre coincide con la
 * suma de su historial: si el número se despega, es un bug y no un dato.
 */
export async function createProductWithInitialStock(input: UpdateProductInput): Promise<Product> {
  const initialStock = Number(input.stock ?? 0);

  const created = await createProduct({ ...input, stock: 0 } as CreateProductInput);

  if (initialStock > 0) {
    await createMovement({
      productId: created.id,
      type: 'ENTRY',
      quantity: initialStock,
      reason: 'Stock inicial',
    });
  }

  return created;
}
