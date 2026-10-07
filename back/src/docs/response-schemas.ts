/**
 * JSON Schemas de las RESPUESTAS.
 *
 * Los requests salen de los schemas de Zod (se convierten solos en la
 * documentación, así que no pueden desincronizarse). Las responses son
 * interfaces TypeScript, así que se escriben a mano acá: es el único lugar
 * donde hay que mantenerlas, y un test de drift verifica que coincidan
 * con lo que la API devuelve de verdad.
 */

export const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: { field: { type: 'string' }, message: { type: 'string' } },
          },
        },
      },
    },
  },
} as const;

export const paginationMetaSchema = {
  type: 'object',
  required: ['page', 'take', 'total', 'totalPages'],
  properties: {
    page: { type: 'integer' },
    take: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
} as const;

export const categorySchema = {
  type: 'object',
  required: ['id', 'name', 'slug', 'createdAt'],
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    slug: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const productSchema = {
  type: 'object',
  required: [
    'id',
    'sku',
    'name',
    'description',
    'price',
    'cost',
    'stock',
    'minStock',
    'isActive',
    'categoryId',
    'category',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'integer' },
    sku: { type: 'string' },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    price: { type: 'number' },
    cost: { type: ['number', 'null'] },
    stock: { type: 'integer' },
    minStock: { type: 'integer', description: 'Stock mínimo antes de marcarlo como crítico' },
    isActive: { type: 'boolean' },
    categoryId: { type: ['integer', 'null'] },
    category: {
      anyOf: [{ $ref: '#/components/schemas/Category' }, { type: 'null' }],
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const stockMovementSchema = {
  type: 'object',
  required: ['id', 'type', 'quantity', 'reason', 'productId', 'product', 'createdAt'],
  properties: {
    id: { type: 'integer' },
    type: { type: 'string', enum: ['ENTRY', 'EXIT', 'ADJUSTMENT'] },
    quantity: {
      type: 'integer',
      description: 'Siempre entero. En ADJUSTMENT lleva signo; en ENTRY/EXIT es positivo.',
    },
    reason: { type: ['string', 'null'] },
    productId: { type: 'integer' },
    product: {
      type: 'object',
      required: ['id', 'name', 'sku'],
      properties: { id: { type: 'integer' }, name: { type: 'string' }, sku: { type: 'string' } },
    },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const dashboardSummarySchema = {
  type: 'object',
  required: [
    'totalProducts',
    'activeProducts',
    'stockUnits',
    'stockValue',
    'lowStockCount',
    'lowStock',
    'movementsLast7Days',
    'stockByCategory',
  ],
  properties: {
    totalProducts: { type: 'integer' },
    activeProducts: { type: 'integer' },
    stockUnits: { type: 'integer', description: 'Suma de stock de los productos activos' },
    stockValue: { type: 'number', description: 'Suma de precio × stock (valor del inventario)' },
    lowStockCount: { type: 'integer' },
    lowStock: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        required: ['id', 'sku', 'name', 'stock', 'minStock'],
        properties: {
          id: { type: 'integer' },
          sku: { type: 'string' },
          name: { type: 'string' },
          stock: { type: 'integer' },
          minStock: { type: 'integer' },
        },
      },
    },
    movementsLast7Days: { type: 'integer' },
    stockByCategory: {
      type: 'array',
      items: {
        type: 'object',
        required: ['categoryId', 'name', 'products', 'units'],
        properties: {
          categoryId: { type: 'integer' },
          name: { type: 'string' },
          products: { type: 'integer' },
          units: { type: 'integer' },
        },
      },
    },
  },
} as const;
