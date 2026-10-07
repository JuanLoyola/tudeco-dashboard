'use client';

import { useEffect, useState } from 'react';
import { getMovements } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { StockMovement } from '@/lib/types';

const TYPE_LABEL: Record<StockMovement['type'], string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Corrección',
};

interface MovementsListProps {
  productId: number;
  /** Se incrementa desde el padre para recargar tras registrar un movimiento. */
  refreshToken: number;
}

/** Historial de movimientos de un producto. */
export default function MovementsList({ productId, refreshToken }: MovementsListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getMovements(productId)
      .then((response) => {
        if (!cancelled) setMovements(response.data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(errorMessage(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, refreshToken]);

  if (loading) return <p className="py-4 text-sm text-slate-500">Cargando historial…</p>;
  if (error) return <p className="py-4 text-sm text-red-400">{error}</p>;
  if (movements.length === 0)
    return <p className="py-4 text-sm text-slate-500">Todavía no hay movimientos.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-white/10 text-[11px] tracking-[0.16em] text-slate-400 uppercase">
        <tr>
          <th className="py-2 pr-3">Fecha</th>
          <th className="py-2 pr-3">Tipo</th>
          <th className="py-2 pr-3 text-right">Cantidad</th>
          <th className="py-2">Motivo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {movements.map((movement) => (
          <tr key={movement.id} className="transition hover:bg-white/[0.04]">
            <td className="py-2 pr-3 text-slate-400">
              {new Date(movement.createdAt).toLocaleDateString('es-AR')}
            </td>
            <td className="py-2 pr-3">{TYPE_LABEL[movement.type]}</td>
            <td
              className={`py-2 pr-3 text-right tabular-nums ${
                movement.type === 'EXIT' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {movement.type === 'EXIT' ? '−' : movement.type === 'ADJUSTMENT' ? '±' : '+'}
              {Math.abs(movement.quantity)}
            </td>
            <td className="py-2 text-slate-400">{movement.reason ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
