import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';

/** UI en /api/docs · documento JSON en /api/docs/openapi.json */
export function createDocsRoutes(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  router.use(
    '/',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Tudeco API',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  return router;
}
