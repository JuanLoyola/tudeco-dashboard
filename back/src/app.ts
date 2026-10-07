import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { errorHandler } from './shared/middleware/error-handler';
import { notFoundHandler } from './shared/middleware/not-found';
import { PrismaCategoryRepository } from './modules/categories/category.repository';
import { createCategoryRoutes } from './modules/categories/category.routes';
import { CategoryService } from './modules/categories/category.service';
import { createDashboardRoutes } from './modules/dashboard/dashboard.routes';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { createDocsRoutes } from './docs/docs.routes';
import { PrismaProductRepository } from './modules/products/product.repository';
import { createProductRoutes } from './modules/products/product.routes';
import { ProductService } from './modules/products/product.service';
import { PrismaStockRepository } from './modules/stock/stock.repository';
import { createStockRoutes } from './modules/stock/stock.routes';
import { StockService } from './modules/stock/stock.service';

/**
 * Composition root: único lugar que conoce las implementaciones concretas.
 * Si mañana cambiás PostgreSQL por otra cosa, sólo se toca este archivo.
 */
export function createApp(): Express {
  const app = express();

  // CORS primero: así el header también viaja en respuestas de error.
  // `origin` es la lista blanca de env.CORS_ORIGIN (el front de Next en el 3000).
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  const categoryRepository = new PrismaCategoryRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);
  const stockRepository = new PrismaStockRepository(prisma);

  const categoryService = new CategoryService(categoryRepository);
  const productService = new ProductService(productRepository, categoryRepository);
  const stockService = new StockService(stockRepository, productRepository);
  const dashboardService = new DashboardService(prisma);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/docs', createDocsRoutes());

  app.use('/api/categories', createCategoryRoutes(categoryService));
  app.use('/api/products', createProductRoutes(productService));
  app.use('/api/stock', createStockRoutes(stockService));
  app.use('/api/dashboard', createDashboardRoutes(dashboardService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
