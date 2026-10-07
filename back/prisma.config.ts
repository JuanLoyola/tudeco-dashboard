import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Configuración de Prisma (reemplaza a package.json#prisma).
 * Ojo: al usar este archivo, el CLI deja de cargar `.env` solo,
 * por eso el `import 'dotenv/config'` de arriba es obligatorio.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
