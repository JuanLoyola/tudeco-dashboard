import type { Request, Response } from 'express';
import {
  createMovementSchema,
  idParamSchema,
  listMovementsQuerySchema,
  type CreateMovementInput,
} from './stock.schemas';
import type { StockService } from './stock.service';

export class StockController {
  constructor(private readonly service: StockService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listMovementsQuerySchema.parse(req.query);
    res.json(await this.service.list(query));
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const input: CreateMovementInput = req.body;
    res.status(201).json({ data: await this.service.register(input) });
  };

  productHistory = async (req: Request, res: Response): Promise<void> => {
    const productId = idParamSchema.parse(req.params.id);
    const query = listMovementsQuerySchema.parse({ ...req.query, productId });
    res.json(await this.service.list(query));
  };
}
