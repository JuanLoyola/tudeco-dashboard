import type { PrismaClient } from '@prisma/client';

export interface LowStockItem {
  id: number;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface CategoryStock {
  categoryId: number;
  name: string;
  products: number;
  units: number;
}

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  stockUnits: number;
  /** Suma de precio × stock: cuánto vale el inventario hoy. */
  stockValue: number;
  lowStockCount: number;
  lowStock: LowStockItem[];
  movementsLast7Days: number;
  stockByCategory: CategoryStock[];
}

/**
 * Queries de lectura para el dashboard.
 *
 * Prisma cubre el CRUD, pero no puede comparar dos columnas entre sí
 * (`stock <= minStock`) ni multiplicar al agrupar: ahí se usa SQL crudo.
 * Como los queries son fijos y sin input del usuario, no hay riesgo de
 * inyección; si algún día lleva parámetros, hay que usar query parametrizada.
 */
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async summary(): Promise<DashboardSummary> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      activeProducts,
      stockUnits,
      stockValue,
      lowStockCount,
      lowStock,
      movementsLast7Days,
      stockByCategory,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.stockUnits(),
      this.stockValue(),
      this.lowStockCount(),
      this.lowStock(),
      this.prisma.stockMovement.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.stockByCategory(),
    ]);

    return {
      totalProducts,
      activeProducts,
      stockUnits,
      stockValue,
      lowStockCount,
      lowStock,
      movementsLast7Days,
      stockByCategory,
    };
  }

  private async stockUnits(): Promise<number> {
    const result = await this.prisma.product.aggregate({
      where: { isActive: true },
      _sum: { stock: true },
    });
    return result._sum.stock ?? 0;
  }

  private async stockValue(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ stockValue: number }>>`
      SELECT COALESCE(SUM(p.price * p.stock), 0)::float AS "stockValue"
        FROM "Product" p
       WHERE p."isActive" = true
    `;
    return rows[0].stockValue;
  }

  private async lowStockCount(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
        FROM "Product" p
       WHERE p."isActive" = true
         AND p.stock <= p."minStock"
    `;
    return rows[0].count;
  }

  private async lowStock(): Promise<LowStockItem[]> {
    return this.prisma.$queryRaw<LowStockItem[]>`
      SELECT p.id, p.sku, p.name, p.stock, p."minStock"
        FROM "Product" p
       WHERE p."isActive" = true
         AND p.stock <= p."minStock"
       ORDER BY (p.stock * 1.0 / NULLIF(p."minStock", 0)) ASC, p.stock ASC
       LIMIT 10
    `;
  }

  private async stockByCategory(): Promise<CategoryStock[]> {
    return this.prisma.$queryRaw<CategoryStock[]>`
      SELECT c.id AS "categoryId",
             c.name,
             COUNT(p.id)::int AS products,
             COALESCE(SUM(p.stock), 0)::int AS units
        FROM "Category" c
        LEFT JOIN "Product" p
          ON p."categoryId" = c.id
         AND p."isActive" = true
       GROUP BY c.id, c.name
       ORDER BY c.name
    `;
  }
}
