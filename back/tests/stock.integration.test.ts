import request from 'supertest';
import { createApp } from '../src/app';
import { disconnect, resetDatabase } from './helpers/database';

const app = createApp();

beforeEach(() => resetDatabase());
afterAll(() => disconnect());

async function seed() {
  const category = (await request(app).post('/api/categories').send({ name: 'Lámparas' })).body
    .data as { id: number };

  const lampara = (
    await request(app).post('/api/products').send({
      sku: 'LMP-001',
      name: 'Lámpara Aurora',
      price: 15000,
      stock: 0,
      minStock: 2,
      categoryId: category.id,
    })
  ).body.data as { id: number };

  const llavero = (
    await request(app).post('/api/products').send({
      sku: 'PER-001',
      name: 'Llavero personalizado',
      price: 3500,
      stock: 0,
      minStock: 10,
      categoryId: category.id,
    })
  ).body.data as { id: number };

  return { category, lampara, llavero };
}

describe('GET /api/dashboard/summary', () => {
  it('devuelve ceros con la base vacía', async () => {
    const res = await request(app).get('/api/dashboard/summary');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalProducts: 0,
      activeProducts: 0,
      stockUnits: 0,
      stockValue: 0,
      lowStockCount: 0,
      movementsLast7Days: 0,
      stockByCategory: [],
    });
  });

  it('consolida stock, valor e inventario crítico', async () => {
    const { lampara, llavero } = await seed();

    // 10 lámparas a $15.000 y 4 llaveros a $3.500
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'ENTRY', quantity: 10 });
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: llavero.id, type: 'ENTRY', quantity: 4 });
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'EXIT', quantity: 3 });

    const res = await request(app).get('/api/dashboard/summary');

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalProducts: 2,
      activeProducts: 2,
      stockUnits: 11, // 7 lámparas + 4 llaveros
      stockValue: 119000, // 7 × 15000 + 4 × 3500
      lowStockCount: 1, // el llavero quedó en 4 con mínimo 10
      movementsLast7Days: 3,
    });

    expect(res.body.data.lowStock).toEqual([
      expect.objectContaining({ sku: 'PER-001', stock: 4, minStock: 10 }),
    ]);
    expect(res.body.data.stockByCategory).toEqual([
      expect.objectContaining({ name: 'Lámparas', products: 2, units: 11 }),
    ]);
  });
});

describe('POST /api/stock/movements', () => {
  it('registra una entrada y actualiza el stock del producto', async () => {
    const { lampara } = await seed();

    const res = await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'ENTRY', quantity: 12, reason: 'Proveedor' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ type: 'ENTRY', quantity: 12, reason: 'Proveedor' });

    const product = await request(app).get(`/api/products/${lampara.id}`);
    expect(product.body.data.stock).toBe(12);
  });

  it('rechaza salir más de lo disponible', async () => {
    const { lampara } = await seed();

    const res = await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'EXIT', quantity: 5 });

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain('Stock insuficiente');
  });

  it('rechaza una corrección en cero', async () => {
    const { lampara } = await seed();

    const res = await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'ADJUSTMENT', quantity: 0 });

    expect(res.status).toBe(400);
  });

  it('lista el historial de un producto', async () => {
    const { lampara, llavero } = await seed();
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: lampara.id, type: 'ENTRY', quantity: 10 });
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: llavero.id, type: 'ENTRY', quantity: 4 });

    const res = await request(app).get(`/api/stock/movements/product/${lampara.id}`);

    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0]).toMatchObject({ productId: lampara.id, product: { sku: 'LMP-001' } });
  });
});
