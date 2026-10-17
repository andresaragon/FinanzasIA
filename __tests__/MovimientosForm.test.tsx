import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import MovimientosScreen from '../src/screens/MovimientosScreen';

const mockEstado: any = {};

jest.mock('../src/store/useFinanzasStore', () => ({
  useFinanzasStore: (selector?: (s: any) => any) => (selector ? selector(mockEstado) : mockEstado),
}));

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

describe('MovimientosForm regresiones (ciclo 2)', () => {
  it('tras varias llamadas a changeText sobre input-monto, el TextInput no se desmonta y conserva la misma instancia', async () => {
    await render(<MovimientosScreen />);
    const nodoInicial = screen.getByTestId('input-monto');

    await fireEvent.changeText(nodoInicial, '1');
    const nodo1 = screen.getByTestId('input-monto');
    expect(nodo1).toBe(nodoInicial);

    await fireEvent.changeText(nodo1, '12');
    const nodo2 = screen.getByTestId('input-monto');
    expect(nodo2).toBe(nodoInicial);

    await fireEvent.changeText(nodo2, '12.500');
    const nodo3 = screen.getByTestId('input-monto');
    expect(nodo3).toBe(nodoInicial);
    expect((nodo3.props as any).value).toBe('12.500');
  });

  it('dos pulsaciones seguidas de btn-guardar mientras agregarGasto está pendiente llaman agregarGasto una sola vez', async () => {
    mockEstado.agregarGasto = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 50))
    );

    await render(<MovimientosScreen />);
    await fireEvent.changeText(screen.getByTestId('input-monto'), '12.500');
    await fireEvent.changeText(screen.getByTestId('input-descripcion'), 'Almuerzo');

    // Dos pulsaciones consecutivas
    await fireEvent.press(screen.getByTestId('btn-guardar'));
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    expect(mockEstado.agregarGasto).toHaveBeenCalledTimes(1);

    await waitFor(() => expect((screen.getByTestId('input-monto').props as any).value).toBe(''));
    expect(mockEstado.agregarGasto).toHaveBeenCalledTimes(1);
  });

  it('limpia el error previo del store al pulsar btn-guardar', async () => {
    await render(<MovimientosScreen />);
    await fireEvent.changeText(screen.getByTestId('input-monto'), '5000');
    await fireEvent.changeText(screen.getByTestId('input-descripcion'), 'Café');
    await fireEvent.press(screen.getByTestId('btn-guardar'));

    expect(mockEstado.limpiarError).toHaveBeenCalled();
  });
});
