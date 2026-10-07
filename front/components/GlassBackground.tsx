interface Blob {
  size: number;
  /** Posición: se puede pinchar cualquiera de las cuatro. */
  position: { top?: string; right?: string; bottom?: string; left?: string };
  color: string;
  /** Duración y desfase del drift, en segundos (para que no se sincronicen). */
  duration: number;
  delay: number;
}

const blobs: Blob[] = [
  { size: 640, position: { top: '-12%', left: '-6%' }, color: '#34d399', duration: 34, delay: -6 },
  { size: 540, position: { top: '6%', right: '-8%' }, color: '#2dd4bf', duration: 42, delay: -16 },
  {
    size: 520,
    position: { bottom: '-14%', left: '20%' },
    color: '#38bdf8',
    duration: 48,
    delay: -24,
  },
  {
    size: 440,
    position: { bottom: '8%', right: '8%' },
    color: '#a78bfa',
    duration: 38,
    delay: -11,
  },
];

/**
 * Decoración de fondo: esferas difuminadas que derivan lento detrás del vidrio.
 * Es puramente visual: no captura clics ni se anuncia a lectores de pantalla.
 */
export default function GlassBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, index) => (
        <span
          key={index}
          className="blob"
          style={{
            ...blob.position,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle at 32% 30%, ${blob.color}, transparent 68%)`,
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
          }}
        />
      ))}

      {/* Viñeta: oscurece los bordes para que el contenido respire. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(4_7_11/0.75))]" />
    </div>
  );
}
