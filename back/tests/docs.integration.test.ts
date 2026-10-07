import request from 'supertest';
import { createApp } from '../src/app';
import { disconnect, resetDatabase } from './helpers/database';

const app = createApp();
const FRONT = 'http://localhost:3000';

beforeEach(() => resetDatabase());
afterAll(() => disconnect());

async function getSpec() {
  const res = await request(app).get('/api/docs/openapi.json');
  expect(res.status).toBe(200);
  return res.body;
}

describe('Swagger / OpenAPI', () => {
  it('publica el documento con todos los endpoints', async () => {
    const spec = await getSpec();

    expect(spec.openapi).toBe('3.1.0');
    expect(Object.keys(spec.paths).sort()).toEqual([
      '/api/categories',
      '/api/dashboard/summary',
      '/api/health',
      '/api/products',
      '/api/products/{id}',
      '/api/stock/movements',
      '/api/stock/movements/product/{id}',
    ]);
  });

  it('sirve la UI de Swagger', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('describe los requests con los mismos schemas que valida Zod', async () => {
    const spec = await getSpec();
    const schema = spec.paths['/api/products'].post.requestBody.content['application/json'].schema;

    expect(schema.required).toEqual(expect.arrayContaining(['sku', 'name', 'price']));
    expect(schema.properties.price.type).toBe('number');
    expect(schema.properties.sku.type).toBe('string');
  });

  it('el producto documentado coincide con el que devuelve la API', async () => {
    const spec = await getSpec();
    await request(app).post('/api/categories').send({ name: 'Lámparas' });
    const created = await request(app)
      .post('/api/products')
      .send({ sku: 'LMP-001', name: 'Lámpara', price: 15000, stock: 4, minStock: 2 });

    const documented = [...spec.components.schemas.Product.required].sort();
    expect(Object.keys(created.body.data).sort()).toEqual(documented);
  });

  it('el resumen del dashboard coincide con lo documentado', async () => {
    const spec = await getSpec();
    const summary = await request(app).get('/api/dashboard/summary');

    expect(Object.keys(summary.body.data).sort()).toEqual(
      [...spec.components.schemas.DashboardSummary.required].sort(),
    );
  });

  it('un movimiento real coincide con lo documentado', async () => {
    const spec = await getSpec();
    const created = await request(app)
      .post('/api/products')
      .send({ sku: 'LMP-001', name: 'Lámpara', price: 15000, stock: 0, minStock: 2 });
    const movement = await request(app)
      .post('/api/stock/movements')
      .send({ productId: created.body.data.id, type: 'ENTRY', quantity: 5 });

    expect(Object.keys(movement.body.data).sort()).toEqual(
      [...spec.components.schemas.StockMovement.required].sort(),
    );
  });
});

describe('CORS', () => {
  it('permite el origen del front de Next', async () => {
    const res = await request(app).get('/api/health').set('Origin', FRONT);

    expect(res.headers['access-control-allow-origin']).toBe(FRONT);
  });

  it('responde al preflight que manda Next con JSON', async () => {
    const res = await request(app)
      .options('/api/products')
      .set('Origin', FRONT)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(res.status).toBeLessThan(300);
    expect(res.headers['access-control-allow-origin']).toBe(FRONT);
    expect(res.headers['access-control-allow-headers']).toBe('content-type');
  });

  it('no habilita orígenes desconocidos', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://evil.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
