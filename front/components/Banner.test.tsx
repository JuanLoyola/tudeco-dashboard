import { render, screen } from '@testing-library/react';
import Banner from '@/components/Banner';

describe('Banner', () => {
  it('renderiza el contenido y se anuncia como alerta', () => {
    render(<Banner>No pude leer la API</Banner>);

    expect(screen.getByRole('alert')).toHaveTextContent('No pude leer la API');
  });

  it('usa el tono warning por defecto', () => {
    render(<Banner>aviso</Banner>);

    expect(screen.getByRole('alert')).toHaveClass('text-amber-300');
  });

  it('acepta el tono danger y clases extra (para el margen)', () => {
    render(
      <Banner tone="danger" className="mt-8">
        fallo
      </Banner>,
    );

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('text-red-300');
    expect(banner).toHaveClass('mt-8');
  });
});
