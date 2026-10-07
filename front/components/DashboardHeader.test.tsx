import { fireEvent, render, screen } from '@testing-library/react';
import DashboardHeader from '@/components/DashboardHeader';

const handlers = {
  onRegisterMovement: jest.fn(),
  onNewProduct: jest.fn(),
  onRefresh: jest.fn(),
};

const renderHeader = (loading = false, canRegisterMovement = true) =>
  render(
    <DashboardHeader loading={loading} canRegisterMovement={canRegisterMovement} {...handlers} />,
  );

beforeEach(() => jest.clearAllMocks());

describe('DashboardHeader', () => {
  it('muestra título y subtítulo', () => {
    renderHeader();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Stock y ventas de Tudeco')).toBeInTheDocument();
  });

  it('dispara las tres acciones', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Registrar movimiento' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(handlers.onRegisterMovement).toHaveBeenCalledTimes(1);
    expect(handlers.onNewProduct).toHaveBeenCalledTimes(1);
    expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el movimiento de stock cuando no hay productos', () => {
    renderHeader(false, false);

    expect(screen.getByRole('button', { name: 'Registrar movimiento' })).toBeDisabled();
  });

  it('refleja la carga en el botón de actualizar', () => {
    renderHeader(true);

    expect(screen.getByRole('button', { name: 'Actualizando…' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Actualizar' })).not.toBeInTheDocument();
  });
});
