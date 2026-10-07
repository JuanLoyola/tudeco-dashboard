import type { Request, Response } from 'express';
import type { DashboardService } from './dashboard.service';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  summary = async (_req: Request, res: Response): Promise<void> => {
    res.json({ data: await this.service.summary() });
  };
}
