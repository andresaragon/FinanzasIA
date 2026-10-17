import { formatearCOP } from '../src/lib/formato';

describe('formatearCOP (criterios A1-A4)', () => {
  it('A1: separa miles con punto y antepone $', () => {
    expect(formatearCOP(1234567)).toBe('$1.234.567');
    expect(formatearCOP(0)).toBe('$0');
    expect(formatearCOP(950)).toBe('$950');
  });

  it('A2: redondea al peso entero', () => {
    expect(formatearCOP(1500.5)).toBe('$1.501');
    expect(formatearCOP(1500.4)).toBe('$1.500');
  });

  it('A3: negativos con signo antes del $', () => {
    expect(formatearCOP(-2500)).toBe('-$2.500');
  });

  it('A4: valores no finitos dan $0 y no lanzan', () => {
    expect(formatearCOP(NaN)).toBe('$0');
    expect(formatearCOP(Infinity)).toBe('$0');
    expect(formatearCOP(-Infinity)).toBe('$0');
  });
});
