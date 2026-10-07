interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'warning';
}

/** Caja de una métrica del dashboard. */
export default function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  const isWarning = tone === 'warning';

  return (
    <div className="glass-soft rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </p>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight tabular-nums ${
          isWarning ? 'text-amber-400' : 'text-slate-50'
        }`}
        data-testid="stat-value"
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}
