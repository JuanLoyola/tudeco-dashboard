import { render, screen } from '@testing-library/react';
import StatCard from '@/components/StatCard';

describe('StatCard', () => {
  it('muestra label, valor y hint', () => {
    render(<StatCard label="Unidades en stock" value="106" hint="11 movimientos" />);

    expect(screen.getByText('Unidades en stock')).toBeInTheDocument();
    expect(screen.getByTestId('stat-value')).toHaveTextContent('106');
    expect(screen.getByText('11 movimientos')).toBeInTheDocument();
  });

  it('usa el tono de alerta cuando hay que avisar', () => {
    render(<StatCard label="Stock crítico" value="3" tone="warning" />);

    expect(screen.getByTestId('stat-value')).toHaveClass('text-amber-400');
  });

  it('no renderiza el hint si no viene', () => {
    const { container } = render(<StatCard label="Valor" value="$ 0" />);

    expect(container.querySelectorAll('p')).toHaveLength(2); // label + valor
  });
});
