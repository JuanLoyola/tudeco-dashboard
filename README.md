# tudeco-dashboard

Monorepo de mi emprendimiento de impresión 3D: **API + dashboard**.

|          | Stack                                                              |
| -------- | ------------------------------------------------------------------ |
| `back/`  | Node 24 · TypeScript · Express 5 · PostgreSQL 18 · Prisma 6 · Jest |
| `front/` | Next 16 (App Router) · Tailwind 4 · Jest + Testing Library         |

## Arrancar

```bash
npm install
cp back/.env.example back/.env   # contraseña de PostgreSQL
npm run db:migrate               # crea la base, el esquema y el seed
npm run dev                      # api en :4000 + web en :3000
```

- **Dashboard:** http://localhost:3000 (crear productos, registrar movimientos, historial)
- **API:** http://localhost:4000/api/health · **Swagger:** http://localhost:4000/api/docs

## Comandos (desde la raíz)

| Comando                                        | Qué hace                                          |
| ---------------------------------------------- | ------------------------------------------------- |
| `npm run dev`                                  | back y front en paralelo (Ctrl+C detiene los dos) |
| `npm test`                                     | tests del back (38) y del front (59)              |
| `npm run typecheck`                            | tipos de ambos, sin compilar                      |
| `npm run build`                                | build de ambos                                    |
| `npm run format` · `format:check`              | formatea (o verifica) todo con Prettier           |
| `npm run db:migrate` · `db:seed` · `db:studio` | atajos al workspace del back                      |

Cada workspace también corre solo: `npm run dev -w back`, `npm test -w front`.

## Estructura

```
back/
  src/modules/    products · categories · stock · dashboard
                  (routes → controller → service → repository)
  src/shared/     errores y middlewares
  src/docs/       documento OpenAPI + Swagger UI
  src/config/     variables de entorno validadas con Zod
  tests/          integración contra la base tudeco_test
  prisma/         esquema, migraciones, seed
front/
  app/            page.tsx (orquestación) + globals.css (sistema glass y animaciones)
  components/     Button · Header · tarjetas · paneles · tabla · modales · fondo
  lib/            cliente HTTP · tipos (uno por dominio) · formatos · stock
```

## Notas

- **UI:** glassmorphism propio en `front/app/globals.css` (`.glass`, `.glass-soft`,
  `.glass-strong`) con esferas animadas de fondo (`components/GlassBackground.tsx`).
  Botones y superficies se reutilizan desde `Button` y las clases de vidrio.

- **La API vive en el 4000** porque Next.js se queda con el 3000 en desarrollo.
- **CORS** sólo acepta los orígenes de `CORS_ORIGIN` en `back/.env`.
- **Prettier** vive en la raíz (`prettier.config.mjs`) y cubre `back/` y `front/`.
- **Tipos duplicados:** `front/lib/types/` copia los DTO del back (un archivo por
  dominio). Cuando crezca, conviene generarlos desde el OpenAPI.
