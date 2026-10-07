import { render, screen } from '@testing-library/react';
import InsightPanels from '@/components/InsightPanels';
import type { DashboardSummary } from '@/lib/types';

const summary: DashboardSummary = {
  totalProducts: 8,
  activeProducts: 7,
  stockUnits: 106,
  stockValue: 646400,
  lowStockCount: 1,
  lowStock: [{ id: 9, sku: 'POR-009', name: 'Porta velas', stock: 4, minStock: 10 }],
  movementsLast7Days: 11,
  stockByCategory: [
    { categoryId: 1, name: 'Lámparas', products: 3, units: 25 },
    { categoryId: 2, name: 'Llaveros', products: 2, units: 40 },
  ],
};

describe('InsightPanels', () => {
  it('lista el stock por categoría', () => {
    render(<InsightPanels summary={summary} />);

    expect(screen.getByText('Stock por categoría')).toBeInTheDocument();
    expect(screen.getByText('Lámparas')).toBeInTheDocument();
    expect(screen.getByText('25 u. · 3 productos')).toBeInTheDocument();
    expect(screen.getByText('40 u. · 2 productos')).toBeInTheDocument();
  });

  it('lista los productos por debajo del mínimo', () => {
    render(<InsightPanels summary={summary} />);

    expect(screen.getByText('Inventario crítico')).toBeInTheDocument();
    expect(screen.getByText('POR-009')).toBeInTheDocument();
    expect(screen.getByText('4 / 10')).toBeInTheDocument();
  });

  it('avisa cuando no hay nada crítico', () => {
    render(<InsightPanels summary={{ ...summary, lowStock: [] }} />);

    expect(screen.getByText('Ningún producto por debajo del mínimo.')).toBeInTheDocument();
  });
});
