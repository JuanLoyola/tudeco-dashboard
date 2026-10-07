'use client';

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

export const inputClass =
  'w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/25 disabled:opacity-60';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Label + control + errores.
 * El `id` se inyecta al control para asociarlo explícitamente con el label
 * (mejor accesibilidad y más fácil de testear con getByLabelText).
 */
export default function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;

  return (
    <div>
      <label htmlFor={id} className="text-sm text-slate-400">
        {label}
      </label>
      <span className="mt-1 block">{control}</span>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block text-xs text-red-400" data-testid="field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
