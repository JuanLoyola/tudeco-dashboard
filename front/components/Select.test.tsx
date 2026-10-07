import { fireEvent, render, screen } from '@testing-library/react';
import Field from '@/components/Field';
import Select from '@/components/Select';

describe('Select', () => {
  it('queda asociado al label que inyecta Field', () => {
    render(
      <Field label="Categoría">
        <Select defaultValue="2">
          <option value="1">Lámparas</option>
          <option value="2">Accesorios</option>
        </Select>
      </Field>,
    );

    expect(screen.getByLabelText('Categoría')).toHaveValue('2');
  });

  it('avisa el cambio de valor y dibuja el chevron', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Select defaultValue="" onChange={onChange} aria-label="Tipo">
        <option value="ENTRY">Entrada (+)</option>
        <option value="EXIT">Salida (−)</option>
      </Select>,
    );

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'EXIT' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
