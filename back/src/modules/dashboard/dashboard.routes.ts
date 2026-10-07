import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import type { DashboardService } from './dashboard.service';

export function createDashboardRoutes(service: DashboardService): Router {
  const router = Router();
  const controller = new DashboardController(service);

  router.get('/summary', controller.summary);

  return router;
}
