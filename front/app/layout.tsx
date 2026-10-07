import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import GlassBackground from '@/components/GlassBackground';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tudeco · Dashboard',
  description: 'Stock y métricas del emprendimiento de impresión 3D',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-void min-h-screen text-slate-200 antialiased">
        <GlassBackground />
        {children}
      </body>
    </html>
  );
}
