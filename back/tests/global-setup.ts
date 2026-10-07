import { execSync } from 'node:child_process';
import 'dotenv/config';

/** Garantiza que la base de test exista y tenga el esquema actualizado. */
export default function globalSetup(): void {
  const url = new URL(process.env.DATABASE_URL ?? '');
  url.pathname = '/tudeco_test';

  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url.toString(), NODE_ENV: 'test' },
  });
}
