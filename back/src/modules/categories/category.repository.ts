import type { Category, PrismaClient } from '@prisma/client';

/** Puerto: lo que el service necesita saber sobre las categorías. */
export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: { name: string; slug: string }): Promise<Category>;
}

/** Adaptador: implementación concreta sobre PostgreSQL vía Prisma. */
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  create(data: { name: string; slug: string }): Promise<Category> {
    return this.prisma.category.create({ data });
  }
}
