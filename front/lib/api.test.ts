/**
 * @jest-environment node
 *
 * El cliente HTTP no necesita DOM, y en node sí existe `fetch` global.
 */
import {
  ApiError,
  apiGet,
  createMovement,
  createProduct,
  deleteProduct,
  getDashboardSummary,
  getProducts,
  updateProduct,
} from './api';

/** Respuesta mínima que alcanza para el cliente: no hace falta un Response completo. */
function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

describe('cliente HTTP', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('apunta a la API del back', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: 1 }));

    await apiGet('/ping');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/api/ping', expect.anything());
  });

  it('desenvuelve el campo data', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { total: 3 } }));

    await expect(apiGet('/algo')).resolves.toEqual({ total: 3 });
  });

  it('pasa el mensaje de error de la API', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        jsonResponse({ error: { code: 'X', message: 'Stock insuficiente' } }, false, 422),
      );

    await expect(getDashboardSummary()).rejects.toThrow('Stock insuficiente');
  });

  it('si la API no devuelve error legible, usa el status', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(null, false, 500));

    await expect(getDashboardSummary()).rejects.toThrow('500');
  });

  it('lista productos con la paginación pedida', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        jsonResponse({ data: [], meta: { page: 1, take: 5, total: 0, totalPages: 1 } }),
      );

    const result = await getProducts(5);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/products?take=5',
      expect.anything(),
    );
    expect(result.meta.total).toBe(0);
  });
});

describe('escrituras', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('crea un producto por POST con JSON', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { id: 9, sku: 'LMP-009' } }));

    const created = await createProduct({
      sku: 'LMP-009',
      name: 'Nueva',
      price: 1000,
      minStock: 1,
    });

    expect(created).toEqual({ id: 9, sku: 'LMP-009' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/products');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init?.body))).toEqual({
      sku: 'LMP-009',
      name: 'Nueva',
      price: 1000,
      minStock: 1,
    });
  });

  it('edita un producto por PATCH a su id', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { id: 7, price: 18000 } }));

    await updateProduct(7, { price: 18000, isActive: false });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/products/7');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({ price: 18000, isActive: false });
  });

  it('registra un movimiento por POST', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { id: 12, type: 'EXIT' } }));

    await createMovement({ productId: 3, type: 'EXIT', quantity: 2, reason: 'Venta' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/stock/movements');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      productId: 3,
      type: 'EXIT',
      quantity: 2,
      reason: 'Venta',
    });
  });

  it('elimina por DELETE y tolera la respuesta 204 sin body', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse(undefined, true, 204));

    await expect(deleteProduct(4)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/products/4');
    expect(init?.method).toBe('DELETE');
  });

  it('un error de negocio (422) queda como ApiError legible', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        jsonResponse(
          { error: { code: 'BUSINESS_RULE_VIOLATION', message: 'Stock insuficiente' } },
          false,
          422,
        ),
      );

    await expect(createMovement({ productId: 1, type: 'EXIT', quantity: 99 })).rejects.toThrow(
      'Stock insuficiente',
    );

    await createMovement({ productId: 1, type: 'EXIT', quantity: 99 }).catch((cause: unknown) => {
      expect(cause).toBeInstanceOf(ApiError);
      expect((cause as ApiError).status).toBe(422);
      expect((cause as ApiError).generalMessages()).toEqual(['Stock insuficiente']);
    });
  });
});

describe('ApiError', () => {
  it('busca errores por campo y agrupa los generales', () => {
    const error = new ApiError('Datos inválidos', 400, 'VALIDATION_ERROR', [
      { field: 'price', message: 'Debe ser mayor a 0' },
      { field: '', message: 'El SKU y el nombre no pueden coincidir' },
    ]);

    expect(error.fieldError('price')).toBe('Debe ser mayor a 0');
    expect(error.fieldError('sku')).toBeUndefined();
    expect(error.generalMessages()).toEqual(['El SKU y el nombre no pueden coincidir']);
  });

  it('sin detalles, el mensaje general es el del error', () => {
    const error = new ApiError('No encontrado', 404, 'NOT_FOUND');

    expect(error.details).toEqual([]);
    expect(error.generalMessages()).toEqual(['No encontrado']);
  });
});
