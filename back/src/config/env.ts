import 'dotenv/config';
import { z } from 'zod';

/**
 * Punto único de acceso a las variables de entorno.
 * Si algo falta o está mal escrito, el proceso no arranca: mejor fallar acá
 * que descubrirlo en el medio de un request.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // El 3000 lo ocupa Next.js en desarrollo: la API vive en 4000.
  PORT: z.coerce.number().int().positive().default(4000),
  // Orígenes permitidos, separados por coma (el front de Next va primero).
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000,http://127.0.0.1:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Configuración inválida:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
