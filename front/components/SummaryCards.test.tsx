import { render, screen } from '@testing-library/react';
import SummaryCards from '@/components/SummaryCards';
import type { DashboardSummary } from '@/lib/types';

const summary: DashboardSummary = {
  totalProducts: 8,
  activeProducts: 7,
  stockUnits: 106,
  stockValue: 646400,
  lowStockCount: 1,
  lowStock: [{ id: 9, sku: 'POR-009', name: 'Porta velas', stock: 4, minStock: 10 }],
  movementsLast7Days: 11,
  stockByCategory: [{ categoryId: 1, name: 'Lámparas', products: 3, units: 25 }],
};

describe('SummaryCards', () => {
  it('muestra las cuatro métricas', () => {
    render(<SummaryCards summary={summary} />);

    expect(screen.getByText('Productos activos')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8 en catálogo')).toBeInTheDocument();

    expect(screen.getByText('Unidades en stock')).toBeInTheDocument();
    expect(screen.getByText('106')).toBeInTheDocument();
    expect(screen.getByText('11 movimientos (7 días)')).toBeInTheDocument();

    expect(screen.getByText('Stock crítico')).toBeInTheDocument();
    expect(screen.getByText('productos por debajo del mínimo')).toBeInTheDocument();
  });

  it('formatea el valor de inventario en pesos', () => {
    render(<SummaryCards summary={summary} />);

    expect(screen.getByText('$ 646.400')).toBeInTheDocument();
  });

  it('marca la alerta cuando hay stock crítico', () => {
    render(<SummaryCards summary={summary} />);

    const values = screen.getAllByTestId('stat-value');
    expect(values[3]).toHaveClass('text-amber-400');
  });

  it('sin stock crítico deja la tarjeta neutra', () => {
    render(<SummaryCards summary={{ ...summary, lowStockCount: 0, lowStock: [] }} />);

    const values = screen.getAllByTestId('stat-value');
    expect(values[3]).toHaveClass('text-slate-50');
  });
});
