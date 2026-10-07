# UI Glass

Sistema de diseño del proyecto: **glassmorphism oscuro con acento esmeralda**.
Las decisiones están tomadas — este documento es la referencia para no rehacerlas.
(Para aplicarlo en otro proyecto está el skill `ui-glass`, con las recetas CSS
copiables en `references/glass-recipes.css`.)

## Decisiones

| Tema          | Decisión                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Acento        | **Esmeralda** `#10b981` / `#34d399` (elegida sobre azul sky y sobre iridiscente)                          |
| Fondo base    | `#04070b` → token `--color-void`                                                                          |
| Texto         | `slate-50` valores · `slate-400` labels · `slate-500` hints · `white` títulos                             |
| Alertas       | Warning = amber · Danger = red                                                                            |
| Prohibido     | Todo `sky-*` en componentes: el azul se eliminó a propósito (solo vive en los orbes de fondo)             |
| Fondo         | **4 orbes animados** (esmeralda · teal · cielo · violeta) con drift lento; se eligió animado, no estático |
| Movimiento    | Entradas suaves (`rise-in` 600ms), modal `pop-in` 280ms, cards que levantan al hover                      |
| Accesibilidad | `prefers-reduced-motion` apaga todo; orbs `aria-hidden`; modales con `role="dialog"` + Escape             |

## Las tres superficies

Definidas como CSS plano en **`@layer components`** (para que las utilidades de
Tailwind puedan sobrescribirlas) dentro de `front/app/globals.css`.

| Clase           | Dónde                    | Qué hace                                                               |
| --------------- | ------------------------ | ---------------------------------------------------------------------- |
| `.glass`        | La ventana del dashboard | Blanco 8%→2% **sobre scrim oscuro** + blur 28px + filo de luz superior |
| `.glass-soft`   | Tarjetas, paneles, tabla | Más sutil: blanco 5,5%→1,5% + blur 16px                                |
| `.glass-strong` | Modales                  | Casi opaco (`rgb(9 17 16/.94)`): el texto nunca pelea con el fondo     |

El **scrim** es lo que mantiene legible el texto cuando un orbe pasa atrás: no
quitarlo para "transparentar más".

## Reglas duras

1. **Nunca `position: fixed` dentro de un ancestor con `backdrop-filter`** — el
   filtro crea _containing block_ y el overlay se recorta al contenedor. Por eso
   los modales son **hermanos** de la ventana vidrio (está comentado en `page.tsx`).
2. **Los orbes viven en un solo componente**: `components/GlassBackground.tsx`
   (`aria-hidden`, `pointer-events-none`, `-z-10`). No se inlinean por página.
3. **El brillo interno** de la ventana es un `absolute inset-0 -z-10`: queda
   sobre el fondo del glass y por debajo del contenido (nunca `z-index: 0`,
   teñiría el texto).
4. **Cursor de mano global** en `@layer base` (`button/select/checkbox/label…`);
   disabled = `not-allowed` + `opacity-50`.
5. **El popup del `<select>` también oscuro**: `color-scheme: dark` +
   `select option { background:#0b1214; color:#e2e8f0 }`.
6. **`prefers-reduced-motion`** desactiva `.blob`, `.anim-rise` y `.anim-pop`.

## Primitivas (reutilizar, no reestilizar)

| Componente                                                      | Detalle                                                                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                                                        | `primary` · `ghost` (default) · `danger` (suave en tablas; `font-semibold` en confirmaciones) · `subtle` · `bare`. Tamaños `sm`/`md`. `type="button"` por defecto. |
| `Select`                                                        | `appearance-none` + chevron SVG propio. **Reenvía el `id` al `<select>`** (lo inyecta `Field` con `cloneElement`).                                                 |
| `Modal`                                                         | Overlay `bg-void/70 backdrop-blur-md`, cierra con Escape y clic afuera, panel `glass-strong anim-pop`.                                                             |
| `Banner`                                                        | `role="alert"`, tonos `danger`/`warning`; el margen lo decide quien lo usa.                                                                                        |
| `Field`                                                         | Label + hint + error por campo; el servidor valida (`ApiError.details`).                                                                                           |
| `StatCard` / `SummaryCards` / `InsightPanels` / `ProductsTable` | superficie `.glass-soft`, `rounded-2xl`, hover lift.                                                                                                               |

## Dónde vive cada cosa

```
front/app/globals.css        tokens · .glass* · keyframes · cursor · option oscuro
front/components/GlassBackground.tsx   los 4 orbes + viñeta
front/components/Button.tsx  variantes y tamaños
front/components/Select.tsx  select con chevron
front/app/page.tsx           ventana .glass + brillo interno (modales fuera)
front/components/Modal.tsx   overlay + glass-strong
```

## Checkpoint antes de cerrar una pantalla

- [ ] Superficie correcta: `.glass` (pantalla) · `.glass-soft` (tarjetas) · `.glass-strong` (modales)
- [ ] Acento esmeralda, cero `sky-*`
- [ ] Modales fuera de cualquier contenedor con `backdrop-filter`
- [ ] Select oscuro y con chevron propio
- [ ] Cursor pointer en acciones, `not-allowed` en disabled
- [ ] `prefers-reduced-motion` respetado
- [ ] Captura final con el modal abierto
