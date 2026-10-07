import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('muestra el título y el contenido', () => {
    render(
      <Modal title="Registrar movimiento" open onClose={jest.fn()}>
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Registrar movimiento');
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('no renderiza nada cuando está cerrado', () => {
    render(
      <Modal title="Título" open={false} onClose={jest.fn()}>
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cierra con Escape', () => {
    const onClose = jest.fn();
    render(
      <Modal title="Título" open onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer clic en el fondo', () => {
    const onClose = jest.fn();
    render(
      <Modal title="Título" open onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    );

    fireEvent.click(screen.getByTestId('modal-overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
