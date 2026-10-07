import 'dotenv/config';

// Corre ANTES de que Jest cargue los archivos de test.
// Apunta la sesión a la base de test para no tocar la de desarrollo.
process.env.NODE_ENV = 'test';

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = '/tudeco_test';
  process.env.DATABASE_URL = url.toString();
}
