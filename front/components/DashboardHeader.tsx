import Button from '@/components/Button';

interface DashboardHeaderProps {
  loading: boolean;
  /** Sin productos no hay nada que mover. */
  canRegisterMovement: boolean;
  onRegisterMovement: () => void;
  onNewProduct: () => void;
  onRefresh: () => void;
}

/** Título + acciones principales del dashboard. */
export default function DashboardHeader({
  loading,
  canRegisterMovement,
  onRegisterMovement,
  onNewProduct,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-emerald-300/80 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]" />
          Tudeco · Inventario
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Stock y ventas de Tudeco</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onRegisterMovement} disabled={!canRegisterMovement}>
          Registrar movimiento
        </Button>
        <Button variant="ghost" onClick={onNewProduct}>
          Nuevo producto
        </Button>
        <Button variant="ghost" onClick={onRefresh} disabled={loading}>
          {loading ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>
    </header>
  );
}
