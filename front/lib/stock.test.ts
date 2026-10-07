/**
 * @jest-environment node
 */
import { createMovement, createProduct } from './api';
import { createProductWithInitialStock } from './stock';

jest.mock('./api', () => ({
  createProduct: jest.fn(),
  createMovement: jest.fn(),
}));

const createProductMock = createProduct as jest.MockedFunction<typeof createProduct>;
const createMovementMock = createMovement as jest.MockedFunction<typeof createMovement>;

const creado: any = { id: 9, sku: 'TMP-001', stock: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  createProductMock.mockResolvedValue(creado);
  createMovementMock.mockResolvedValue({} as any);
});

describe('createProductWithInitialStock', () => {
  it('crea el producto con stock 0 y explica las unidades con un movimiento', async () => {
    const result = await createProductWithInitialStock({
      sku: 'TMP-001',
      name: 'Producto de prueba',
      price: 1000,
      minStock: 1,
      stock: 5,
    });

    // si mandara `stock: 5` además del movimiento, el stock quedaría doble
    expect(createProductMock).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'TMP-001', stock: 0 }),
    );
    expect(createMovementMock).toHaveBeenCalledWith({
      productId: 9,
      type: 'ENTRY',
      quantity: 5,
      reason: 'Stock inicial',
    });
    expect(result).toBe(creado);
  });

  it('sin stock inicial no registra ningún movimiento', async () => {
    await createProductWithInitialStock({ sku: 'X', name: 'X', price: 1, minStock: 0, stock: 0 });

    expect(createProductMock).toHaveBeenCalledWith(expect.objectContaining({ stock: 0 }));
    expect(createMovementMock).not.toHaveBeenCalled();
  });

  it('tolera el alta sin stock en el payload (toma 0)', async () => {
    await createProductWithInitialStock({ sku: 'X', name: 'X', price: 1, minStock: 0 });

    expect(createMovementMock).not.toHaveBeenCalled();
  });
});
