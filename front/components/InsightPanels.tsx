import type { DashboardSummary } from '@/lib/types';

const panelClass = 'glass-soft rounded-2xl p-5 transition duration-300 hover:border-white/15';
const panelTitle = 'text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400';

/** Los dos paneles de detalle: stock por categoría e inventario crítico. */
export default function InsightPanels({ summary }: { summary: DashboardSummary }) {
  return (
    <section
      className="anim-rise mt-4 grid gap-4 lg:grid-cols-2"
      style={{ animationDelay: '140ms' }}
    >
      <div className={panelClass}>
        <h2 className={panelTitle}>Stock por categoría</h2>
        <ul className="mt-4 space-y-3">
          {summary.stockByCategory.map((category) => (
            <li
              key={category.categoryId}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/5"
            >
              <span>{category.name}</span>
              <span className="text-slate-400 tabular-nums">
                {category.units} u. · {category.products} productos
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={panelClass}>
        <h2 className={panelTitle}>Inventario crítico</h2>
        {summary.lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Ningún producto por debajo del mínimo.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {summary.lowStock.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/5"
              >
                <span>
                  {item.name} <span className="font-mono text-xs text-slate-500">{item.sku}</span>
                </span>
                <span className="text-amber-400 tabular-nums">
                  {item.stock} / {item.minStock}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
