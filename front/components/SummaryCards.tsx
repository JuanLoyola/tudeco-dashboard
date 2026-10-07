import StatCard from '@/components/StatCard';
import { money } from '@/lib/format';
import type { DashboardSummary } from '@/lib/types';

/** Las 4 métricas de arriba. */
export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="anim-rise mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Productos activos"
        value={String(summary.activeProducts)}
        hint={`${summary.totalProducts} en catálogo`}
      />
      <StatCard
        label="Unidades en stock"
        value={String(summary.stockUnits)}
        hint={`${summary.movementsLast7Days} movimientos (7 días)`}
      />
      <StatCard label="Valor de inventario" value={money(summary.stockValue)} />
      <StatCard
        label="Stock crítico"
        value={String(summary.lowStockCount)}
        tone={summary.lowStockCount > 0 ? 'warning' : 'default'}
        hint="productos por debajo del mínimo"
      />
    </section>
  );
}
