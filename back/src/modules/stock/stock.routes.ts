import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { StockController } from './stock.controller';
import { createMovementSchema } from './stock.schemas';
import type { StockService } from './stock.service';

export function createStockRoutes(service: StockService): Router {
  const router = Router();
  const controller = new StockController(service);

  router.get('/movements', controller.list);
  router.get('/movements/product/:id', controller.productHistory);
  router.post('/movements', validate(createMovementSchema), controller.register);

  return router;
}
