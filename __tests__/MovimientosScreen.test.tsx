import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import MovimientosScreen from '../src/screens/MovimientosScreen';

const mockEstado: any = {};

jest.mock('../src/store/useFinanzasStore', () => ({
  useFinanzasStore: (selector?: (s: any) => any) => (selector ? selector(mockEstado) : mockEstado),
}));

function seleccionada(id: string): boolean {
  const props: any = screen.getByTestId(id).props;
  return props.accessibilityState?.selected === true || props['aria-selected'] === true;
}

function valor(id: string): string {
  return (screen.getByTestId(id).props as any).value;
}

beforeEach(() => {
  Object.assign(mockEstado, {
    gastos: [],
    categorias: [
      { id: 'c1', nombre: 'Alimentación', icono: null },
      { id: 'c2', nombre: 'Transporte', icono: null },
    ],
    error: null,
    agregarGasto: jest.fn().mockResolvedValue(true),
    limpiarError: jest.fn(),
    cargar: jest.fn(),
  });
});

async function llenar(monto: string, descripcion: string) {
  await fireEvent.changeText(screen.getByTestId('input-monto'), monto);
  await fireEvent.changeText(screen.getByTestId('input-descripcion'), descripcion);
}

describe('MovimientosScreen (criterios E1-E5)', () => {
  it('E1: guarda un gasto válido con la categoría elegida', async () => {
    await render(<MovimientosScreen />);
    await llenar('12.500', 'Almuerzo');
    await fireEvent.press(screen.getByTestId('categoria-c1'));
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    await waitFor(() => expect(mockEstado.agregarGasto).toHaveBeenCalledTimes(1));
    expect(mockEstado.agregarGasto).toHaveBeenCalledWith({
      monto: 12500,
      descripcion: 'Almuerzo',
      categoriaId: 'c1',
      origen: 'texto',
    });
  });

  it('E2: sin categoría elegida guarda con categoriaId null', async () => {
    await render(<MovimientosScreen />);
    await llenar('3000', 'Tinto');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    await waitFor(() => expect(mockEstado.agregarGasto).toHaveBeenCalledTimes(1));
    expect(mockEstado.agregarGasto).toHaveBeenCalledWith({
      monto: 3000,
      descripcion: 'Tinto',
      categoriaId: null,
      origen: 'texto',
    });
  });

  it('E3: monto inválido no guarda y muestra error-monto', async () => {
    await render(<MovimientosScreen />);
    await llenar('abc', 'Algo');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    expect(mockEstado.agregarGasto).not.toHaveBeenCalled();
    expect(screen.queryByTestId('error-monto')).toBeTruthy();
    expect(screen.queryByTestId('error-descripcion')).toBeNull();
  });

  it('E3: descripción vacía no guarda y muestra error-descripcion', async () => {
    await render(<MovimientosScreen />);
    await llenar('5000', '   ');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    expect(mockEstado.agregarGasto).not.toHaveBeenCalled();
    expect(screen.queryByTestId('error-descripcion')).toBeTruthy();
    expect(screen.queryByTestId('error-monto')).toBeNull();
  });

  it('E4: si se guardó, vacía monto y descripción', async () => {
    await render(<MovimientosScreen />);
    await llenar('12.500', 'Almuerzo');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    await waitFor(() => expect(valor('input-monto')).toBe(''));
    expect(valor('input-descripcion')).toBe('');
  });

  it('E4: si falló, conserva lo escrito', async () => {
    mockEstado.agregarGasto = jest.fn().mockResolvedValue(false);
    await render(<MovimientosScreen />);
    await llenar('12.500', 'Almuerzo');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    await waitFor(() => expect(mockEstado.agregarGasto).toHaveBeenCalledTimes(1));
    expect(valor('input-monto')).toBe('12.500');
    expect(valor('input-descripcion')).toBe('Almuerzo');
  });

  it('E5: la categoría elegida se marca como seleccionada', async () => {
    await render(<MovimientosScreen />);
    expect(seleccionada('categoria-c1')).toBe(false);
    await fireEvent.press(screen.getByTestId('categoria-c1'));
    expect(seleccionada('categoria-c1')).toBe(true);
    expect(seleccionada('categoria-c2')).toBe(false);
  });

  it('muestra error-guardado solo cuando el store tiene error', async () => {
    await render(<MovimientosScreen />);
    expect(screen.queryByTestId('error-guardado')).toBeNull();
  });

  it('muestra error-guardado con el mensaje del store', async () => {
    mockEstado.error = 'fallo de red';
    await render(<MovimientosScreen />);
    expect(screen.getByTestId('error-guardado')).toBeTruthy();
    expect(JSON.stringify(screen.getByTestId('error-guardado').props.children)).toContain(
      'fallo de red'
    );
  });
});
