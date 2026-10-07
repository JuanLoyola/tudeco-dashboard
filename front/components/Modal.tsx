'use client';

import { useEffect, type ReactNode } from 'react';
import Button from '@/components/Button';

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Overlay genérico: cierra con Escape o clic afuera. */
export default function Modal({ title, open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="bg-void/70 absolute inset-0 backdrop-blur-md"
        onClick={onClose}
        data-testid="modal-overlay"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-strong anim-pop relative my-auto w-full max-w-lg rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Button variant="bare" size="sm" aria-label="Cerrar" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
