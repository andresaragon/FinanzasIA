import { readFileSync } from 'fs';
import { join } from 'path';

const sql = readFileSync(join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');

const CATEGORIAS = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Otros',
];

describe('supabase/schema.sql (criterios G1-G2)', () => {
  it('G1: siembra las 8 categorías globales', () => {
    const idx = sql.search(/insert\s+into\s+categories/i);
    expect(idx).toBeGreaterThanOrEqual(0);
    const siembra = sql.slice(idx);
    for (const nombre of CATEGORIAS) {
      expect(siembra).toContain(nombre);
    }
  });

  it('G2: la siembra es idempotente', () => {
    const idx = sql.search(/insert\s+into\s+categories/i);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(sql.slice(idx)).toMatch(/where\s+not\s+exists|on\s+conflict/i);
  });

  it('G2: conserva las políticas RLS existentes', () => {
    for (const politica of [
      'categorias propias o globales',
      'insertar categorias propias',
      'keywords legibles',
      'gastos propios',
      'correcciones propias',
      'presupuestos propios',
    ]) {
      expect(sql).toContain(`"${politica}"`);
    }
    expect(sql).toMatch(/alter table expenses enable row level security/i);
  });
});
