import type { Request, Response } from 'express';
import { createCategorySchema, type CreateCategoryInput } from './category.schemas';
import type { CategoryService } from './category.service';

/** La capa HTTP: traduce request → datos y datos → respuesta. Nada más. */
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.json({ data: await this.service.list() });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input: CreateCategoryInput = createCategorySchema.parse(req.body);
    const category = await this.service.create(input);
    res.status(201).json({ data: category });
  };
}
