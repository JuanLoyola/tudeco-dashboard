import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import type { Category, Product, UpdateProductInput } from '@/lib/types';
import ProductForm from './ProductForm';

const categories: Category[] = [
  { id: 1, name: 'Lámparas', slug: 'lamparas', createdAt: '2026-01-01' },
];

const product: Product = {
  id: 1,
  sku: 'LMP-001',
  name: 'Lámpara Aurora',
  description: 'Descripción vieja',
  price: 15000,
  cost: 6000,
  stock: 10,
  minStock: 2,
  isActive: true,
  categoryId: 1,
  category: categories[0],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

function fillRequired() {
  fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'LMP-004' } });
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Lámpara Nueva' } });
  fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '12000' } });
  fireEvent.change(screen.getByLabelText('Stock mínimo'), { target: { value: '3' } });
}

describe('ProductForm · alta', () => {
  it('arma el payload numérico con el stock inicial', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<ProductForm mode="create" categories={categories} onSubmit={onSubmit} />);

    fillRequired();
    fireEvent.change(screen.getByLabelText('Stock inicial'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: 'LMP-004',
          name: 'Lámpara Nueva',
          price: 12000,
          minStock: 3,
          stock: 7,
          categoryId: 1,
        }),
      ),
    );
  });

  it('recuerda que el stock se mueve con movimientos', () => {
    render(<ProductForm mode="create" categories={categories} onSubmit={jest.fn()} />);

    expect(screen.getByText(/El stock se modifica con movimientos/)).toBeInTheDocument();
  });
});

describe('ProductForm · edición', () => {
  it('no deja editar el stock y sí el estado', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <ProductForm mode="edit" product={product} categories={categories} onSubmit={onSubmit} />,
    );

    expect(screen.queryByLabelText('Stock inicial')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Producto activo (aparece en el catálogo)'));
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '18000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0] as UpdateProductInput;
    expect(payload).toMatchObject({ price: 18000, isActive: false });
    expect(payload).not.toHaveProperty('stock');
  });

  it('precarga los valores actuales del producto', () => {
    render(
      <ProductForm mode="edit" product={product} categories={categories} onSubmit={jest.fn()} />,
    );

    expect(screen.getByLabelText('SKU')).toHaveValue('LMP-001');
    expect(screen.getByLabelText('Precio')).toHaveValue(15000); // input type=number → número
    expect(screen.getByLabelText('Categoría')).toHaveValue('1');
    expect(screen.getByLabelText('Producto activo (aparece en el catálogo)')).toBeChecked();
  });

  it('pinta el error de campo del backend', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValue(
        new ApiError('Datos inválidos', 400, 'VALIDATION_ERROR', [
          { field: 'sku', message: 'Ese SKU ya existe' },
        ]),
      );
    render(<ProductForm mode="create" categories={categories} onSubmit={onSubmit} />);

    fillRequired();
    fireEvent.change(screen.getByLabelText('Stock inicial'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByTestId('field-error')).toHaveTextContent('Ese SKU ya existe');
  });
});
