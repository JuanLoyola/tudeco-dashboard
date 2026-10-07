import type { Prisma, PrismaClient } from '@prisma/client';
import type { ListProductsQuery } from './product.schemas';
import type { ProductWithCategory } from './product.types';

export interface ProductPage {
  rows: ProductWithCategory[];
  total: number;
}

const withCategory = { category: true } satisfies Prisma.ProductInclude;

/** Puerto: todo lo que el service necesita saber del almacenamiento. */
export interface ProductRepository {
  findPage(query: ListProductsQuery): Promise<ProductPage>;
  findById(id: number): Promise<ProductWithCategory | null>;
  findBySku(sku: string, exceptId?: number): Promise<ProductWithCategory | null>;
  hasMovements(productId: number): Promise<boolean>;
  countMovements(productId: number): Promise<number>;
  create(data: Prisma.ProductUncheckedCreateInput): Promise<ProductWithCategory>;
  update(id: number, data: Prisma.ProductUncheckedUpdateInput): Promise<ProductWithCategory>;
  remove(id: number): Promise<void>;
}

/** Adaptador concreto sobre PostgreSQL. El SQL lo escribe Prisma. */
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPage(query: ListProductsQuery): Promise<ProductPage> {
    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: withCategory,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.take,
        take: query.take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { rows, total };
  }

  findById(id: number): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({ where: { id }, include: withCategory });
  }

  findBySku(sku: string, exceptId?: number): Promise<ProductWithCategory | null> {
    return this.prisma.product.findFirst({
      where: { sku, ...(exceptId ? { id: { not: exceptId } } : {}) },
      include: withCategory,
    });
  }

  countMovements(productId: number): Promise<number> {
    return this.prisma.stockMovement.count({ where: { productId } });
  }

  async hasMovements(productId: number): Promise<boolean> {
    return (await this.countMovements(productId)) > 0;
  }

  create(data: Prisma.ProductUncheckedCreateInput): Promise<ProductWithCategory> {
    return this.prisma.product.create({ data, include: withCategory });
  }

  update(id: number, data: Prisma.ProductUncheckedUpdateInput): Promise<ProductWithCategory> {
    return this.prisma.product.update({ where: { id }, data, include: withCategory });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
