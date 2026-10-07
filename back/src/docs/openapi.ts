import { z } from 'zod';
import { env } from '../config/env';
import { createCategorySchema } from '../modules/categories/category.schemas';
import { createProductSchema, updateProductSchema } from '../modules/products/product.schemas';
import { createMovementSchema } from '../modules/stock/stock.schemas';
import {
  categorySchema,
  dashboardSummarySchema,
  errorSchema,
  paginationMetaSchema,
  productSchema,
  stockMovementSchema,
} from './response-schemas';

/**
 * Documentación OpenAPI. Dos fuentes, sin repetir código:
 *  - requests  → se generan desde los schemas de Zod (imposible que se desincronicen)
 *  - responses → response-schemas.ts (verificadas por tests/docs.integration.test.ts)
 */

const jsonSchema = (schema: z.ZodType): Record<string, unknown> =>
  z.toJSONSchema(schema, {
    target: 'draft-2020-12',
    io: 'input',
    unrepresentable: 'any',
  });

const json = (schema: unknown, description = 'OK') => ({
  description,
  content: { 'application/json': { schema } },
});

/** `{ data: X }` — formato estándar de respuesta de la API. */
const wrapped = (schema: unknown) => ({
  type: 'object',
  required: ['data'],
  properties: { data: schema },
});

const listOf = (schema: unknown) => ({
  type: 'object',
  required: ['data', 'meta'],
  properties: {
    data: { type: 'array', items: schema },
    meta: { $ref: '#/components/schemas/PaginationMeta' },
  },
});

const errorResponse = (description: string) =>
  json({ $ref: '#/components/schemas/Error' }, description);

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador numérico',
  schema: { type: 'integer', minimum: 1 },
} as const;

const pagingParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'take', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
];

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Tudeco API',
    version: '0.1.0',
    description:
      'API local del dashboard de stock de Tudeco (impresión 3D). ' +
      'Sin autenticación: corre sólo en tu máquina.',
  },
  servers: [{ url: `http://localhost:${env.PORT}`, description: 'Desarrollo local' }],
  tags: [
    { name: 'health', description: 'Salud del servidor' },
    { name: 'categories', description: 'Categorías de productos' },
    { name: 'products', description: 'Catálogo: precios y stock base' },
    { name: 'stock', description: 'Movimientos de stock (libro de inventario)' },
    { name: 'dashboard', description: 'Métricas agregadas' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['health'],
        summary: 'Estado del servidor',
        responses: {
          200: json({
            type: 'object',
            required: ['status', 'uptime'],
            properties: { status: { type: 'string' }, uptime: { type: 'number' } },
          }),
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['categories'],
        summary: 'Listar categorías',
        responses: {
          200: json(wrapped({ type: 'array', items: { $ref: '#/components/schemas/Category' } })),
        },
      },
      post: {
        tags: ['categories'],
        summary: 'Crear categoría',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: jsonSchema(createCategorySchema) } },
        },
        responses: {
          201: json(wrapped({ $ref: '#/components/schemas/Category' }), 'Categoría creada'),
          400: errorResponse('Datos inválidos'),
          409: errorResponse('Slug duplicado'),
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['products'],
        summary: 'Listar productos paginados',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Por nombre o SKU',
          },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          {
            name: 'includeInactive',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
          ...pagingParams,
        ],
        responses: {
          200: json(listOf({ $ref: '#/components/schemas/Product' })),
        },
      },
      post: {
        tags: ['products'],
        summary: 'Crear producto',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: jsonSchema(createProductSchema) } },
        },
        responses: {
          201: json(wrapped({ $ref: '#/components/schemas/Product' }), 'Producto creado'),
          400: errorResponse('Datos inválidos'),
          404: errorResponse('Categoría inexistente'),
          409: errorResponse('SKU duplicado'),
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['products'],
        summary: 'Detalle de un producto',
        parameters: [idParam],
        responses: {
          200: json(wrapped({ $ref: '#/components/schemas/Product' })),
          404: errorResponse('Producto inexistente'),
        },
      },
      patch: {
        tags: ['products'],
        summary: 'Actualizar producto (parcial)',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: jsonSchema(updateProductSchema) } },
        },
        responses: {
          200: json(wrapped({ $ref: '#/components/schemas/Product' }), 'Producto actualizado'),
          400: errorResponse('Datos inválidos'),
          404: errorResponse('Producto inexistente'),
          409: errorResponse('SKU duplicado'),
        },
      },
      delete: {
        tags: ['products'],
        summary: 'Eliminar producto',
        description: 'Responde 422 si el producto tiene historial de stock: desactivalo con PATCH.',
        parameters: [idParam],
        responses: {
          204: { description: 'Eliminado' },
          404: errorResponse('Producto inexistente'),
          422: errorResponse('Tiene movimientos de stock'),
        },
      },
    },
    '/api/stock/movements': {
      get: {
        tags: ['stock'],
        summary: 'Historial de movimientos',
        parameters: [
          { name: 'productId', in: 'query', schema: { type: 'integer' } },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['ENTRY', 'EXIT', 'ADJUSTMENT'] },
          },
          ...pagingParams,
        ],
        responses: {
          200: json(listOf({ $ref: '#/components/schemas/StockMovement' })),
        },
      },
      post: {
        tags: ['stock'],
        summary: 'Registrar un movimiento de stock',
        description:
          'ENTRY suma, EXIT resta, ADJUSTMENT aplica la cantidad con signo. ' +
          'Actualiza el stock del producto y crea el movimiento en la misma transacción.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: jsonSchema(createMovementSchema) } },
        },
        responses: {
          201: json(
            wrapped({ $ref: '#/components/schemas/StockMovement' }),
            'Movimiento registrado',
          ),
          400: errorResponse('Datos inválidos'),
          404: errorResponse('Producto inexistente'),
          422: errorResponse('Stock insuficiente'),
        },
      },
    },
    '/api/stock/movements/product/{id}': {
      get: {
        tags: ['stock'],
        summary: 'Movimientos de un producto',
        parameters: [idParam, ...pagingParams],
        responses: {
          200: json(listOf({ $ref: '#/components/schemas/StockMovement' })),
        },
      },
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['dashboard'],
        summary: 'Resumen para el dashboard',
        responses: {
          200: json(wrapped({ $ref: '#/components/schemas/DashboardSummary' })),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: errorSchema,
      PaginationMeta: paginationMetaSchema,
      Category: categorySchema,
      Product: productSchema,
      StockMovement: stockMovementSchema,
      DashboardSummary: dashboardSummarySchema,
    },
  },
};
