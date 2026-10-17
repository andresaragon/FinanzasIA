import { render, screen } from '@testing-library/react-native';
import TableroScreen from '../src/screens/TableroScreen';

const mockEstado: any = {};

jest.mock('../src/store/useFinanzasStore', () => ({
  useFinanzasStore: (selector?: (s: any) => any) => (selector ? selector(mockEstado) : mockEstado),
}));

function texto(id: string): string {
  const hijos = (screen.getByTestId(id).props as any).children;
  return ([] as any[]).concat(hijos).join('').replace(/\s+/g, ' ').trim();
}

function gasto(id: string, monto: number, categoriaId: string | null, creadoEn: string) {
  return { id, userId: 'u1', monto, descripcion: id, categoriaId, origen: 'texto', creadoEn };
}

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-10-20T15:00:00Z') });
  Object.assign(mockEstado, {
    cargando: false,
    cargar: jest.fn(),
    categorias: [
      { id: 'c1', nombre: 'Alimentación', icono: null },
      { id: 'c2', nombre: 'Transporte', icono: null },
    ],
    gastos: [
      gasto('g1', 10000, 'c1', '2026-10-02T15:00:00Z'),
      gasto('g2', 5000, 'c1', '2026-10-05T15:00:00Z'),
      gasto('g3', 30000, 'c2', '2026-10-10T15:00:00Z'),
      gasto('g4', 2000, null, '2026-10-11T15:00:00Z'),
      gasto('g5', 99999, 'c1', '2026-09-30T15:00:00Z'), // septiembre: no cuenta
    ],
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TableroScreen (criterios F1-F3)', () => {
  it('llama cargar() al montarse', async () => {
    await render(<TableroScreen />);
    expect(mockEstado.cargar).toHaveBeenCalled();
  });

  it('F1: total-mes suma solo el mes actual', async () => {
    await render(<TableroScreen />);
    expect(texto('total-mes')).toBe('$47.000');
  });

  it('F2: una fila por categoría con su total del mes', async () => {
    await render(<TableroScreen />);
    expect(texto('cat-c1')).toBe('Alimentación $15.000');
    expect(texto('cat-c2')).toBe('Transporte $30.000');
    expect(texto('cat-sin-categoria')).toBe('Sin categoría $2.000');
  });

  it('F3: sin gastos en el mes muestra el mensaje vacío', async () => {
    mockEstado.gastos = [gasto('g5', 99999, 'c1', '2026-09-30T15:00:00Z')];
    await render(<TableroScreen />);
    expect(screen.queryByText('Aún no hay gastos registrados.')).toBeTruthy();
    expect(texto('total-mes')).toBe('$0');
  });

  it('F3: con cargando=true no muestra el mensaje vacío', async () => {
    mockEstado.gastos = [];
    mockEstado.cargando = true;
    await render(<TableroScreen />);
    expect(screen.queryByText('Aún no hay gastos registrados.')).toBeNull();
  });
});
