import type { Request, Response } from 'express';
import {
  idParamSchema,
  listProductsQuerySchema,
  type CreateProductInput,
  type UpdateProductInput,
} from './product.schemas';
import type { ProductService } from './product.service';

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listProductsQuerySchema.parse(req.query);
    res.json(await this.service.list(query));
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const id = idParamSchema.parse(req.params.id);
    res.json({ data: await this.service.get(id) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input: CreateProductInput = req.body;
    res.status(201).json({ data: await this.service.create(input) });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = idParamSchema.parse(req.params.id);
    const input: UpdateProductInput = req.body;
    res.json({ data: await this.service.update(id, input) });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const id = idParamSchema.parse(req.params.id);
    await this.service.remove(id);
    res.status(204).send();
  };
}
