import { Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { ProductService } from './product.service';
import type { ProductRepository, ProductPage } from './product.repository';
import type { CategoryRepository } from '../categories/category.repository';
import type { ProductWithCategory } from './product.types';
import type { ListProductsQuery } from './product.schemas';

/**
 * Pruebas unitarias del service: sin Express, sin HTTP y sin base de datos.
 * Los repositorios son simples: se prueban las REGLAS, no la infraestructura.
 */

let nextId = 1;

const knownCategories = [{ id: 1, name: 'Lámparas', slug: 'lamparas', createdAt: new Date() }];

function makeProduct(overrides: Partial<ProductWithCategory> = {}): ProductWithCategory {
  const now = new Date();
  return {
    id: nextId++,
    sku: `SKU-${nextId}`,
    name: 'Lámpara Aurora',
    description: null,
    price: new Prisma.Decimal(15000),
    cost: new Prisma.Decimal(6000),
    stock: 10,
    minStock: 2,
    isActive: true,
    categoryId: 1,
    createdAt: now,
    updatedAt: now,
    category: { id: 1, name: 'Lámparas', slug: 'lamparas', createdAt: now },
    ...overrides,
  };
}

function fakeProductRepository(store: ProductWithCategory[] = []): ProductRepository {
  return {
    findPage: async (query: ListProductsQuery): Promise<ProductPage> => {
      const rows = store.filter((p) => query.includeInactive || p.isActive);
      return {
        rows: rows.slice((query.page - 1) * query.take, query.page * query.take),
        total: rows.length,
      };
    },
    findById: async (id) => store.find((p) => p.id === id) ?? null,
    findBySku: async (sku, exceptId) =>
      store.find((p) => p.sku === sku && p.id !== exceptId) ?? null,
    countMovements: async () => 0,
    hasMovements: async () => false,
    create: async (data) => {
      const categoryId = (data.categoryId as number | undefined) ?? null;
      const product = makeProduct({
        sku: String(data.sku),
        name: String(data.name),
        price: new Prisma.Decimal(Number(data.price)),
        stock: Number(data.stock ?? 0),
        minStock: Number(data.minStock ?? 0),
        isActive: data.isActive !== false,
        categoryId,
        category: categoryId === 1 ? knownCategories[0] : null,
      });
      store.push(product);
      return product;
    },
    update: async (id, data) => {
      const product = store.find((p) => p.id === id)!;
      Object.assign(product, data, { updatedAt: new Date() });
      return product;
    },
    remove: async (id) => {
      store.splice(
        store.findIndex((p) => p.id === id),
        1,
      );
    },
  };
}

function fakeCategoryRepository(ids: number[]): CategoryRepository {
  const categories = ids.map(
    (id) =>
      knownCategories.find((c) => c.id === id) ?? {
        id,
        name: `Categoría ${id}`,
        slug: `categoria-${id}`,
        createdAt: new Date(),
      },
  );

  return {
    findAll: async () => categories,
    findById: async (id) => categories.find((c) => c.id === id) ?? null,
    findBySlug: async (slug) => categories.find((c) => c.slug === slug) ?? null,
    create: async (data) => ({ id: 99, ...data, createdAt: new Date() }),
  };
}

const query: ListProductsQuery = {
  page: 1,
  take: 20,
  includeInactive: false,
};

describe('ProductService', () => {
  it('crea un producto y expone el precio como número', async () => {
    const service = new ProductService(fakeProductRepository(), fakeCategoryRepository([1]));

    const product = await service.create({
      sku: 'LMP-001',
      name: 'Lámpara Aurora',
      price: 15000,
      stock: 5,
      minStock: 2,
      isActive: true,
      categoryId: 1,
    });

    expect(product.price).toBe(15000);
    expect(product.stock).toBe(5);
    expect(product.category?.slug).toBe('lamparas');
  });

  it('rechaza un SKU duplicado', async () => {
    const store = [makeProduct({ sku: 'LMP-001' })];
    const service = new ProductService(fakeProductRepository(store), fakeCategoryRepository([1]));

    await expect(
      service.create({
        sku: 'LMP-001',
        name: 'Otra',
        price: 100,
        stock: 0,
        minStock: 0,
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rechaza una categoría inexistente', async () => {
    const service = new ProductService(fakeProductRepository(), fakeCategoryRepository([1]));

    await expect(
      service.create({
        sku: 'LMP-002',
        name: 'Otra',
        price: 100,
        stock: 0,
        minStock: 0,
        isActive: true,
        categoryId: 404,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('devuelve 404 al pedir un producto que no existe', async () => {
    const service = new ProductService(fakeProductRepository(), fakeCategoryRepository([1]));

    await expect(service.get(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('calcula la metadata de paginación', async () => {
    const store = Array.from({ length: 45 }, (_, i) => makeProduct({ id: i + 1 }));
    const service = new ProductService(fakeProductRepository(store), fakeCategoryRepository([1]));

    const result = await service.list({ ...query, take: 20, page: 2 });

    expect(result.meta).toEqual({ page: 2, take: 20, total: 45, totalPages: 3 });
    expect(result.data).toHaveLength(20);
  });
});
