import { mesBogota, resumenMensual } from '../src/lib/resumen';
import type { Categoria, Gasto } from '../src/types';

const categorias: Categoria[] = [
  { id: 'c1', nombre: 'Alimentación', icono: null },
  { id: 'c2', nombre: 'Transporte', icono: null },
  { id: 'c3', nombre: 'Salud', icono: null },
];

function gasto(id: string, monto: number, categoriaId: string | null, creadoEn: string): Gasto {
  return { id, userId: 'u1', monto, descripcion: id, categoriaId, origen: 'texto', creadoEn };
}

describe('mesBogota (criterio C1)', () => {
  it('mes de una fecha a mediodía UTC', () => {
    expect(mesBogota('2026-10-15T12:00:00Z')).toBe('2026-10');
  });

  it('usa UTC-5 en los bordes del mes', () => {
    expect(mesBogota('2026-10-01T03:00:00Z')).toBe('2026-09');
    expect(mesBogota('2026-11-01T04:59:59Z')).toBe('2026-10');
    expect(mesBogota('2026-11-01T05:00:00Z')).toBe('2026-11');
  });

  it('cruza el año correctamente', () => {
    expect(mesBogota('2027-01-01T04:00:00Z')).toBe('2026-12');
  });
});

describe('resumenMensual (criterios C2-C6)', () => {
  const gastos: Gasto[] = [
    gasto('g1', 10000, 'c1', '2026-10-02T15:00:00Z'),
    gasto('g2', 5000, 'c1', '2026-10-20T15:00:00Z'),
    gasto('g3', 30000, 'c2', '2026-10-10T15:00:00Z'),
    gasto('g4', 2000, null, '2026-10-11T15:00:00Z'),
    gasto('g5', 1000, 'no-existe', '2026-10-12T15:00:00Z'),
    gasto('g6', 99999, 'c1', '2026-09-30T15:00:00Z'), // septiembre
    gasto('g7', 7777, 'c3', '2026-10-01T03:00:00Z'), // 30 sep en Bogotá
  ];

  it('C2/C3: total y filas ordenadas de mayor a menor', () => {
    const r = resumenMensual(gastos, categorias, '2026-10');
    expect(r.total).toBe(10000 + 5000 + 30000 + 2000 + 1000);
    expect(r.porCategoria).toEqual([
      { categoriaId: 'c2', nombre: 'Transporte', total: 30000 },
      { categoriaId: 'c1', nombre: 'Alimentación', total: 15000 },
      { categoriaId: null, nombre: 'Sin categoría', total: 3000 },
    ]);
    expect(r.porCategoria.reduce((a, f) => a + f.total, 0)).toBe(r.total);
  });

  it('C3: no incluye categorías sin gastos en el mes (Salud)', () => {
    const r = resumenMensual(gastos, categorias, '2026-10');
    expect(r.porCategoria.find((f) => f.categoriaId === 'c3')).toBeUndefined();
  });

  it('C1/C2: el mes se calcula en hora de Bogotá', () => {
    const sept = resumenMensual(gastos, categorias, '2026-09');
    expect(sept.total).toBe(99999 + 7777);
  });

  it('C4: nulo e inexistente quedan en una sola fila "Sin categoría"', () => {
    const r = resumenMensual(gastos, categorias, '2026-10');
    const sin = r.porCategoria.filter((f) => f.categoriaId === null);
    expect(sin).toHaveLength(1);
    expect(sin[0].nombre).toBe('Sin categoría');
  });

  it('C5: mes sin gastos', () => {
    expect(resumenMensual(gastos, categorias, '2025-01')).toEqual({ total: 0, porCategoria: [] });
    expect(resumenMensual([], categorias, '2026-10')).toEqual({ total: 0, porCategoria: [] });
  });

  it('C6: no muta las entradas', () => {
    const g = JSON.parse(JSON.stringify(gastos));
    const c = JSON.parse(JSON.stringify(categorias));
    resumenMensual(gastos, categorias, '2026-10');
    expect(gastos).toEqual(g);
    expect(categorias).toEqual(c);
  });
});
