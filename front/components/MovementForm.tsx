'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Field, { inputClass } from '@/components/Field';
import Select from '@/components/Select';
import { ApiError } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { CreateMovementInput, MovementType, Product } from '@/lib/types';

interface MovementFormProps {
  products: Product[];
  initialProductId?: number;
  onSubmit: (input: CreateMovementInput) => Promise<void>;
}

const TYPE_LABELS: Record<MovementType, string> = {
  ENTRY: 'Entrada (+)',
  EXIT: 'Salida (−)',
  ADJUSTMENT: 'Corrección (con signo)',
};

/** Alta de movimiento de stock. La validación la hace el backend. */
export default function MovementForm({ products, initialProductId, onSubmit }: MovementFormProps) {
  const [productId, setProductId] = useState(initialProductId ? String(initialProductId) : '');
  const [type, setType] = useState<MovementType>('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSubmit({
        productId: Number(productId),
        type,
        quantity: Number(quantity),
        reason: reason.trim() || undefined,
      });
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause : new ApiError(errorMessage(cause), 500, 'UNKNOWN'),
      );
    } finally {
      setSaving(false);
    }
  };

  const invalid = error?.generalMessages() ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Producto" error={error?.fieldError('productId')}>
        <Select value={productId} onChange={(event) => setProductId(event.target.value)} required>
          <option value="" disabled>
            Elegí un producto…
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} · {product.name} (stock {product.stock})
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tipo de movimiento" error={error?.fieldError('type')}>
        <Select value={type} onChange={(event) => setType(event.target.value as MovementType)}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label={type === 'ADJUSTMENT' ? 'Nuevo valor (con signo)' : 'Cantidad'}
        error={error?.fieldError('quantity')}
        hint={
          type === 'ADJUSTMENT'
            ? 'Ej: -3 para anotar pérdida, +5 para sumar lo faltante.'
            : type === 'EXIT'
              ? 'El backend rechaza salir de más.'
              : undefined
        }
      >
        <input
          type="number"
          className={inputClass}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />
      </Field>

      <Field label="Motivo (opcional)" error={error?.fieldError('reason')}>
        <input
          type="text"
          className={inputClass}
          value={reason}
          maxLength={200}
          placeholder="Venta feria, reposición, merma…"
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>

      {invalid.length > 0 ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 backdrop-blur"
          role="alert"
        >
          {invalid.join(' · ')}
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={saving || products.length === 0}>
          {saving ? 'Registrando…' : 'Registrar movimiento'}
        </Button>
      </div>
    </form>
  );
}
