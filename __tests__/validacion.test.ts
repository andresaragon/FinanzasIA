import { parsearMonto, validarGasto } from '../src/lib/validacion';

describe('parsearMonto (criterios B1-B2)', () => {
  it.each([
    ['12.500', 12500],
    ['12500', 12500],
    ['$ 12.500', 12500],
    ['1.234.567', 1234567],
    ['12.500,50', 12500.5],
    ['3,5', 3.5],
  ])('B1: %p -> %p', (texto, esperado) => {
    expect(parsearMonto(texto)).toBe(esperado);
  });

  it.each([[''], ['  '], ['abc'], ['12a'], ['1,2,3']])('B2: %p -> null', (texto) => {
    expect(parsearMonto(texto)).toBeNull();
  });
});

describe('validarGasto (criterios B3-B4)', () => {
  it('B3: gasto válido', () => {
    expect(validarGasto({ monto: 12500, descripcion: 'Almuerzo' })).toEqual({ ok: true });
  });

  it('B4: monto inválido solo marca monto', () => {
    for (const monto of [null, NaN, 0, -5]) {
      const r: any = validarGasto({ monto, descripcion: 'Almuerzo' });
      expect(r.ok).toBe(false);
      expect(typeof r.errores.monto).toBe('string');
      expect(r.errores.monto.length).toBeGreaterThan(0);
      expect(r.errores.descripcion).toBeUndefined();
    }
  });

  it('B4: descripción vacía o en blanco solo marca descripcion', () => {
    for (const descripcion of ['', '   ']) {
      const r: any = validarGasto({ monto: 100, descripcion });
      expect(r.ok).toBe(false);
      expect(typeof r.errores.descripcion).toBe('string');
      expect(r.errores.descripcion.length).toBeGreaterThan(0);
      expect(r.errores.monto).toBeUndefined();
    }
  });

  it('B4: ambos inválidos marca ambos', () => {
    const r: any = validarGasto({ monto: null, descripcion: ' ' });
    expect(r.ok).toBe(false);
    expect(r.errores.monto).toBeTruthy();
    expect(r.errores.descripcion).toBeTruthy();
  });
});
