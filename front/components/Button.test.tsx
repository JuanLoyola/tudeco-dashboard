import { fireEvent, render, screen } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button', () => {
  it('renderiza los hijos y dispara onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Nuevo producto</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aplica la variante y el tamaño pedidos', () => {
    render(
      <Button variant="primary" size="sm">
        Guardar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveClass('from-emerald-300');
    expect(button).toHaveClass('px-2');
  });

  it('deshabilita el botón', () => {
    render(<Button disabled>Actualizar</Button>);

    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeDisabled();
  });

  it('por defecto no dispara el submit del formulario', () => {
    render(
      <form onSubmit={jest.fn()}>
        <Button>Cancelar</Button>
        <Button type="submit">Enviar</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
  });
});
