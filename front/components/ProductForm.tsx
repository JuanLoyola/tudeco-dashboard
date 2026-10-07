'use client';

import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Field, { inputClass } from '@/components/Field';
import Select from '@/components/Select';
import { ApiError } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { Category, Product, UpdateProductInput } from '@/lib/types';

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  categories: Category[];
  onSubmit: (input: UpdateProductInput) => Promise<void>;
}

/**
 * Alta y edición de productos. El stock NO se edita acá:
 * se modifica únicamente con movimientos (ENTRY / EXIT / ADJUSTMENT),
 * para que el historial siempre explique el número.
 */
export default function ProductForm({ mode, product, categories, onSubmit }: ProductFormProps) {
  const editing = mode === 'edit';

  const [sku, setSku] = useState(product?.sku ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [cost, setCost] = useState(product?.cost !== null && product ? String(product.cost) : '');
  const [minStock, setMinStock] = useState(product ? String(product.minStock) : '');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ? String(product.categoryId) : '',
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const input: UpdateProductInput = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      cost: cost.trim() === '' ? null : Number(cost),
      minStock: Number(minStock),
      categoryId: categoryId ? Number(categoryId) : null,
      ...(editing ? { isActive } : { stock: Number(stock) }),
    };

    try {
      await onSubmit(input);
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU" error={error?.fieldError('sku')}>
          <input
            className={inputClass}
            value={sku}
            maxLength={40}
            required
            placeholder="LMP-004"
            onChange={(event) => setSku(event.target.value)}
          />
        </Field>

        <Field label="Nombre" error={error?.fieldError('name')}>
          <input
            className={inputClass}
            value={name}
            maxLength={120}
            required
            placeholder="Lámpara Aurora"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label="Precio" error={error?.fieldError('price')}>
          <input
            type="number"
            className={inputClass}
            value={price}
            min={0}
            step="0.01"
            required
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>

        <Field label="Costo (opcional)" error={error?.fieldError('cost')}>
          <input
            type="number"
            className={inputClass}
            value={cost}
            min={0}
            step="0.01"
            onChange={(event) => setCost(event.target.value)}
          />
        </Field>

        <Field
          label="Stock mínimo"
          error={error?.fieldError('minStock')}
          hint="Debajo de este número se marca como crítico."
        >
          <input
            type="number"
            className={inputClass}
            value={minStock}
            min={0}
            required
            onChange={(event) => setMinStock(event.target.value)}
          />
        </Field>

        <Field label="Categoría" error={error?.fieldError('categoryId')}>
          <Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        {!editing ? (
          <Field label="Stock inicial" error={error?.fieldError('stock')}>
            <input
              type="number"
              className={inputClass}
              value={stock}
              min={0}
              required
              placeholder="0"
              onChange={(event) => setStock(event.target.value)}
            />
          </Field>
        ) : null}
      </div>

      <Field label="Descripción (opcional)" error={error?.fieldError('description')}>
        <textarea
          className={inputClass}
          value={description}
          rows={3}
          maxLength={2000}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      {editing ? (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Producto activo (aparece en el catálogo)
        </label>
      ) : (
        <p className="text-xs text-slate-500">
          El stock se modifica con movimientos, no editando el producto.
        </p>
      )}

      {invalid.length > 0 ? (
        <div
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 backdrop-blur"
          role="alert"
        >
          {invalid.join(' · ')}
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
