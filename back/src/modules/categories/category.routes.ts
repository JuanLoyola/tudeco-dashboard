import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { CategoryController } from './category.controller';
import { createCategorySchema } from './category.schemas';
import type { CategoryService } from './category.service';

export function createCategoryRoutes(service: CategoryService): Router {
  const router = Router();
  const controller = new CategoryController(service);

  router.get('/', controller.list);
  router.post('/', validate(createCategorySchema), controller.create);

  return router;
}
