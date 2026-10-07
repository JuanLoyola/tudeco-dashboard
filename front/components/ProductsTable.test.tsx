import { fireEvent, render, screen } from '@testing-library/react';
import ProductsTable from '@/components/ProductsTable';
import type { Product } from '@/lib/types';

const base: Product = {
  id: 1,
  sku: 'LMP-001',
  name: 'Lámpara Aurora',
  description: null,
  price: 15000,
  cost: 6000,
  stock: 10,
  minStock: 2,
  isActive: true,
  categoryId: 1,
  category: { id: 1, name: 'Lámparas', slug: 'lamparas', createdAt: '2026-01-01' },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const products: Product[] = [
  base,
  { ...base, id: 2, sku: 'PER-001', name: 'Llavero', stock: 4, minStock: 10, category: null },
];

const handlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onHistory: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('ProductsTable', () => {
  it('renderiza una fila por producto', () => {
    render(<ProductsTable products={products} {...handlers} />);

    expect(screen.getByText('Lámpara Aurora')).toBeInTheDocument();
    expect(screen.getByText('Llavero')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2
  });

  it('marca el stock por debajo del mínimo', () => {
    const { container } = render(<ProductsTable products={products} {...handlers} />);

    const critical = container.querySelector('[data-critical="true"]');
    expect(critical).toHaveTextContent('4 · mínimo 10');
    expect(critical).toHaveClass('text-amber-400');

    const healthy = container.querySelector('[data-critical="false"]');
    expect(healthy).toHaveTextContent('10');
  });

  it('muestra el precio formateado y la categoría', () => {
    render(<ProductsTable products={products} {...handlers} />);

    expect(screen.getAllByText('$ 15.000')).toHaveLength(2);
    expect(screen.getByText('Lámparas')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument(); // sin categoría
  });

  it('dispara las acciones de la fila', () => {
    render(<ProductsTable products={[base]} {...handlers} />);

    fireEvent.click(screen.getByRole('button', { name: 'Historial' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(handlers.onHistory).toHaveBeenCalledWith(base);
    expect(handlers.onEdit).toHaveBeenCalledWith(base);
    expect(handlers.onDelete).toHaveBeenCalledWith(base);
  });

  it('avisa cuando no hay productos', () => {
    render(<ProductsTable products={[]} {...handlers} />);

    expect(screen.getByText('No hay productos cargados.')).toBeInTheDocument();
  });
});
