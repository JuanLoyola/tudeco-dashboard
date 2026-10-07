import { fireEvent, render, screen } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import type { CreateMovementInput, Product } from '@/lib/types';
import MovementForm from './MovementForm';

const products: Product[] = [
  {
    id: 1,
    sku: 'LMP-001',
    name: 'Lámpara Aurora',
    description: null,
    price: 15000,
    cost: null,
    stock: 10,
    minStock: 2,
    isActive: true,
    categoryId: null,
    category: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

function fill(overrides: Partial<CreateMovementInput> = {}) {
  if (overrides.productId !== undefined) {
    fireEvent.change(screen.getByLabelText('Producto'), {
      target: { value: String(overrides.productId) },
    });
  }
  if (overrides.type !== undefined) {
    fireEvent.change(screen.getByLabelText('Tipo de movimiento'), {
      target: { value: overrides.type },
    });
  }
  if (overrides.quantity !== undefined) {
    fireEvent.change(screen.getByLabelText('Cantidad'), {
      target: { value: String(overrides.quantity) },
    });
  }
  if (overrides.reason !== undefined) {
    fireEvent.change(screen.getByLabelText('Motivo (opcional)'), {
      target: { value: overrides.reason },
    });
  }
}

describe('MovementForm', () => {
  it('arma y envía el movimiento', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<MovementForm products={products} onSubmit={onSubmit} />);

    fill({ productId: 1, type: 'EXIT', quantity: 3, reason: 'Venta feria' });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));

    await screen.findByText('Registrando…');
    expect(onSubmit).toHaveBeenCalledWith({
      productId: 1,
      type: 'EXIT',
      quantity: 3,
      reason: 'Venta feria',
    });
  });

  it('arranca con el producto preseleccionado', () => {
    const onSubmit = jest.fn();
    render(<MovementForm products={products} initialProductId={1} onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Producto')).toHaveValue('1');
  });

  it('pinta el error de campo que devuelve el backend', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(
        new ApiError('Datos inválidos', 400, 'VALIDATION_ERROR', [
          { field: 'quantity', message: 'La cantidad debe ser mayor a 0' },
        ]),
      );
    render(<MovementForm products={products} onSubmit={onSubmit} />);

    fill({ productId: 1, quantity: 5 });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));

    expect(await screen.findByTestId('field-error')).toHaveTextContent(
      'La cantidad debe ser mayor a 0',
    );
  });

  it('muestra en el banner los errores sin campo (reglas de negocio)', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(new ApiError('Stock insuficiente', 422, 'BUSINESS_RULE_VIOLATION'));
    render(<MovementForm products={products} onSubmit={onSubmit} />);

    fill({ productId: 1, quantity: 99 });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Stock insuficiente');
  });

  it('no se puede enviar sin productos', () => {
    const onSubmit = jest.fn();
    render(<MovementForm products={[]} onSubmit={onSubmit} />);

    expect(screen.getByRole('button', { name: 'Registrar movimiento' })).toBeDisabled();
  });
});
