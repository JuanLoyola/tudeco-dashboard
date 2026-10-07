import { fireEvent, render, screen } from '@testing-library/react';
import DashboardModals, { type ModalState } from '@/components/DashboardModals';
import { getMovements } from '@/lib/api';
import type { Category, Product } from '@/lib/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  getMovements: jest.fn(),
}));

const product: Product = {
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

const categories: Category[] = [
  { id: 1, name: 'Lámparas', slug: 'lamparas', createdAt: '2026-01-01' },
];

const handlers = {
  onCreateProduct: jest.fn().mockResolvedValue(undefined),
  onUpdateProduct: jest.fn().mockResolvedValue(undefined),
  onCreateMovement: jest.fn().mockResolvedValue(undefined),
  onDeleteProduct: jest.fn(),
  onClose: jest.fn(),
};

const renderModals = (modal: ModalState, products: Product[] = [product]) =>
  render(
    <DashboardModals
      modal={modal}
      products={products}
      categories={categories}
      refreshToken={0}
      busy={false}
      onClose={handlers.onClose}
      onCreateProduct={handlers.onCreateProduct}
      onUpdateProduct={handlers.onUpdateProduct}
      onCreateMovement={handlers.onCreateMovement}
      onDeleteProduct={handlers.onDeleteProduct}
    />,
  );

beforeEach(() => {
  jest.clearAllMocks();
  (getMovements as jest.Mock).mockResolvedValue({ data: [], meta: {} });
});

describe('DashboardModals', () => {
  it('no renderiza nada con el modal cerrado', () => {
    const { container } = renderModals(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('avisa que no hay productos cuando no se puede mover stock', () => {
    renderModals({ kind: 'movement' }, []);

    expect(screen.getByText('Primero creá un producto.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cantidad')).not.toBeInTheDocument();
  });

  it('abre el formulario de movimiento', () => {
    renderModals({ kind: 'movement', productId: 1 });

    expect(screen.getByRole('dialog', { name: 'Registrar movimiento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
  });

  it('abre el alta de producto', () => {
    renderModals({ kind: 'newProduct' });

    expect(screen.getByRole('dialog', { name: 'Nuevo producto' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('abre la edición con los datos cargados', () => {
    renderModals({ kind: 'editProduct', product });

    expect(screen.getByRole('dialog', { name: 'Editar · Lámpara Aurora' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Lámpara Aurora');
    expect(screen.getByLabelText('SKU')).toHaveValue('LMP-001');
  });

  it('abre el historial del producto', async () => {
    renderModals({ kind: 'history', product });

    expect(screen.getByRole('dialog', { name: 'Historial · Lámpara Aurora' })).toBeInTheDocument();
    expect(getMovements).toHaveBeenCalledWith(product.id);
    expect(await screen.findByText('Todavía no hay movimientos.')).toBeInTheDocument();
  });

  it('confirma y cancela la eliminación', () => {
    renderModals({ kind: 'delete', product });

    expect(screen.getByText(/Vas a eliminar "Lámpara Aurora" \(LMP-001\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
    expect(handlers.onDeleteProduct).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(handlers.onDeleteProduct).toHaveBeenCalledTimes(1);
  });

  it('pasa el producto y el input al editar', () => {
    renderModals({ kind: 'editProduct', product });

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Aurora II' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(handlers.onUpdateProduct).toHaveBeenCalledWith(product, expect.anything());
  });
});
