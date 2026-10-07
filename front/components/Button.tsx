import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle' | 'bare';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950 font-semibold shadow-lg shadow-emerald-500/25 hover:brightness-110 active:translate-y-px',
  ghost:
    'border border-white/15 bg-white/5 text-slate-200 hover:border-emerald-400/50 hover:bg-white/10 hover:text-white',
  danger:
    'border border-red-500/25 bg-red-500/10 text-red-300 hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-200',
  subtle:
    'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white',
  bare: 'text-slate-400 hover:bg-white/10 hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'rounded-lg px-2 py-1 text-xs',
  md: 'rounded-xl px-4 py-2 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

/**
 * El botón del proyecto: un solo lugar para variantes y tamaños.
 * `type` por defecto es `button` para no disparar submits por accidente;
 * se pisa con `<Button type="submit">` adentro de los formularios.
 */
export default function Button({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
