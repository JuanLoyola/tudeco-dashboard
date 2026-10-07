import type { ReactNode, SelectHTMLAttributes } from 'react';
import { inputClass } from '@/components/Field';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

/**
 * `<select>` con aspecto propio: sin la flecha del sistema (`appearance-none`)
 * y con un chevron dibujado sobre el vidrio.
 *
 * El `id` lo inyecta `Field` con `cloneElement`, así que se reenvía al
 * `<select>` para que el `label` siga asociado (y `getByLabelText` funcione).
 */
export default function Select({ id, className = '', children, ...props }: SelectProps) {
  return (
    <span className="relative block">
      <select
        id={id}
        className={`${inputClass} cursor-pointer appearance-none pr-9 ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
      >
        <path
          d="m5 7.5 5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
