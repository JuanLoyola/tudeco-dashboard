import request from 'supertest';
import { createApp } from '../src/app';
import { disconnect, resetDatabase } from './helpers/database';

const app = createApp();

beforeEach(() => resetDatabase());
afterAll(() => disconnect());

async function createCategory(name: string): Promise<{ id: number; name: string }> {
  const res = await request(app).post('/api/categories').send({ name });
  expect(res.status).toBe(201);
  return res.body.data;
}

const validProduct = {
  sku: 'LMP-001',
  name: 'Lámpara Aurora',
  price: 15000,
  stock: 10,
  minStock: 2,
};

describe('GET /api/products', () => {
  it('devuelve una lista paginada', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], meta: { page: 1, take: 20, total: 0, totalPages: 1 } });
  });

  it('filtra por búsqueda', async () => {
    await request(app).post('/api/products').send(validProduct);
    await request(app)
      .post('/api/products')
      .send({ ...validProduct, sku: 'LMP-002', name: 'Llavero' });

    const res = await request(app).get('/api/products').query({ search: 'lavero' });

    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].name).toBe('Llavero');
  });
});

describe('POST /api/products', () => {
  it('crea un producto con precio numérico', async () => {
    const res = await request(app).post('/api/products').send(validProduct);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      sku: 'LMP-001',
      name: 'Lámpara Aurora',
      price: 15000,
      stock: 10,
      isActive: true,
      category: null,
    });
  });

  it('acepta categorías y las incluye en la respuesta', async () => {
    const category = await createCategory('Lámparas');

    const res = await request(app)
      .post('/api/products')
      .send({ ...validProduct, categoryId: category.id });

    expect(res.body.data.category).toMatchObject({ id: category.id, slug: 'lamparas' });
  });

  it('responde 409 ante un SKU repetido', async () => {
    await request(app).post('/api/products').send(validProduct);
    const res = await request(app).post('/api/products').send(validProduct);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('responde 400 con el detalle de los campos inválidos', async () => {
    const res = await request(app).post('/api/products').send({ sku: 'X', name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain('price');
  });

  it('responde 404 si la categoría no existe', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ ...validProduct, categoryId: 999 });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('Categoría');
  });
});

describe('PATCH /api/products/:id', () => {
  it('actualiza precio y estado', async () => {
    const created = await request(app).post('/api/products').send(validProduct);

    const res = await request(app)
      .patch(`/api/products/${created.body.data.id}`)
      .send({ price: 17500, isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ price: 17500, isActive: false, name: 'Lámpara Aurora' });

    // Un PATCH parcial no debe reactivar el producto por accidente.
    const again = await request(app)
      .patch(`/api/products/${created.body.data.id}`)
      .send({ price: 18000 });

    expect(again.body.data).toMatchObject({ price: 18000, isActive: false });
  });

  it('responde 404 con un id inexistente', async () => {
    const res = await request(app).patch('/api/products/999').send({ price: 1 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  it('borra un producto sin historial', async () => {
    const created = await request(app).post('/api/products').send(validProduct);

    const del = await request(app).delete(`/api/products/${created.body.data.id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/products/${created.body.data.id}`);
    expect(after.status).toBe(404);
  });

  it('prohíbe borrar un producto con movimientos de stock', async () => {
    const created = await request(app).post('/api/products').send(validProduct);
    await request(app)
      .post('/api/stock/movements')
      .send({ productId: created.body.data.id, type: 'ENTRY', quantity: 5 });

    const res = await request(app).delete(`/api/products/${created.body.data.id}`);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('BUSINESS_RULE_VIOLATION');
  });
});
