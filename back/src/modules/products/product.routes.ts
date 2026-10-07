import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { ProductController } from './product.controller';
import { createProductSchema, updateProductSchema } from './product.schemas';
import type { ProductService } from './product.service';

export function createProductRoutes(service: ProductService): Router {
  const router = Router();
  const controller = new ProductController(service);

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validate(createProductSchema), controller.create);
  router.patch('/:id', validate(updateProductSchema), controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
