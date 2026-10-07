import type { ReactNode } from 'react';

type Tone = 'danger' | 'warning';

const tones: Record<Tone, string> = {
  danger: 'border-red-500/30 bg-red-500/10 text-red-300',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
};

interface BannerProps {
  tone?: Tone;
  /** Margen superior, lo decide quien lo usa. */
  className?: string;
  children: ReactNode;
}

/** Aviso en página. `role="alert"` para que se anuncie al aparecer. */
export default function Banner({ tone = 'warning', className = '', children }: BannerProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-xl ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
