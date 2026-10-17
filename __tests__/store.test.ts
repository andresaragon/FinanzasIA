jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(),
  },
}));

import { supabase } from '../src/lib/supabase';
import { useFinanzasStore } from '../src/store/useFinanzasStore';

type Fila = Record<string, unknown>;

// Una "tabla" falsa: select() y select().order() resuelven a las filas; insert() al resultado configurado.
function crearTabla(filas: Fila[]) {
  const resultado = { data: filas, error: null };
  const consulta: any = {
    then: (ok: any, fail: any) => Promise.resolve(resultado).then(ok, fail),
    order: () => consulta,
  };
  return {
    select: jest.fn(() => consulta),
    insert: jest.fn().mockResolvedValue({ error: null }),
  };
}

let tablas: Record<string, ReturnType<typeof crearTabla>>;

const SESION: any = { user: { id: 'u1' } };

beforeEach(() => {
  tablas = {
    expenses: crearTabla([
      {
        id: 'g1',
        user_id: 'u1',
        monto: '1500.50',
        descripcion: 'Tinto',
        categoria_id: 'c1',
        origen: 'texto',
        created_at: '2026-10-02T15:00:00Z',
      },
    ]),
    categories: crearTabla([{ id: 'c1', nombre: 'Alimentación', icono: null }]),
    budgets: crearTabla([
      { id: 'p1', categoria_id: 'c1', monto_limite: '200000.00', mes: '2026-10' },
    ]),
  };
  (supabase.from as jest.Mock).mockImplementation((nombre: string) => tablas[nombre]);
  useFinanzasStore.setState({
    session: SESION,
    gastos: [],
    categorias: [],
    presupuestos: [],
    cargando: false,
    error: null,
  } as any);
});

const gastoNuevo = {
  monto: 12500,
  descripcion: 'Almuerzo',
  categoriaId: 'c1',
  origen: 'texto' as const,
};

describe('store: cargar (criterio D1)', () => {
  it('convierte monto y monto_limite a number', async () => {
    await useFinanzasStore.getState().cargar();
    const { gastos, presupuestos } = useFinanzasStore.getState();
    expect(gastos[0].monto).toBe(1500.5);
    expect(typeof gastos[0].monto).toBe('number');
    expect(presupuestos[0].montoLimite).toBe(200000);
    expect(typeof presupuestos[0].montoLimite).toBe('number');
  });
});

describe('store: error (criterio D2)', () => {
  it('inicia en null en un store recién creado', () => {
    jest.isolateModules(() => {
      const { useFinanzasStore: fresco } = require('../src/store/useFinanzasStore');
      expect(fresco.getState().error).toBeNull();
    });
  });

  it('limpiarError lo devuelve a null', () => {
    useFinanzasStore.setState({ error: 'algo' } as any);
    (useFinanzasStore.getState() as any).limpiarError();
    expect((useFinanzasStore.getState() as any).error).toBeNull();
  });
});

describe('store: agregarGasto (criterios D3-D5)', () => {
  it('D3/D5: inserta con user_id y recarga; devuelve true', async () => {
    const antes = tablas.expenses.select.mock.calls.length;
    const ok = await (useFinanzasStore.getState() as any).agregarGasto(gastoNuevo);
    expect(ok).toBe(true);
    expect(tablas.expenses.insert).toHaveBeenCalledTimes(1);
    expect(tablas.expenses.insert).toHaveBeenCalledWith({
      user_id: 'u1',
      monto: 12500,
      descripcion: 'Almuerzo',
      categoria_id: 'c1',
      origen: 'texto',
    });
    expect(tablas.expenses.select.mock.calls.length).toBeGreaterThan(antes);
    expect((useFinanzasStore.getState() as any).error).toBeNull();
  });

  it('D4/D5: si el insert falla guarda el mensaje, no recarga y no lanza', async () => {
    tablas.expenses.insert.mockResolvedValue({ error: { message: 'fallo de red' } });
    const antes = tablas.expenses.select.mock.calls.length;
    const ok = await (useFinanzasStore.getState() as any).agregarGasto(gastoNuevo);
    expect(ok).toBe(false);
    expect((useFinanzasStore.getState() as any).error).toBe('fallo de red');
    expect(tablas.expenses.select.mock.calls.length).toBe(antes);
  });

  it('D4: un éxito posterior deja error en null', async () => {
    useFinanzasStore.setState({ error: 'viejo' } as any);
    const ok = await (useFinanzasStore.getState() as any).agregarGasto(gastoNuevo);
    expect(ok).toBe(true);
    expect((useFinanzasStore.getState() as any).error).toBeNull();
  });

  it('D5: sin sesión devuelve false y no inserta', async () => {
    useFinanzasStore.setState({ session: null });
    const ok = await (useFinanzasStore.getState() as any).agregarGasto(gastoNuevo);
    expect(ok).toBe(false);
    expect(tablas.expenses.insert).not.toHaveBeenCalled();
  });
});

describe('store: cerrarSesion (criterio D6)', () => {
  it('reinicia error a null', async () => {
    useFinanzasStore.setState({ error: 'x' } as any);
    await useFinanzasStore.getState().cerrarSesion();
    expect((useFinanzasStore.getState() as any).error).toBeNull();
    expect(useFinanzasStore.getState().session).toBeNull();
  });
});
