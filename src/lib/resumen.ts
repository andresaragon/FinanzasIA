import type { Categoria, Gasto } from '../types';

export type FilaCategoria = {
  categoriaId: string | null;
  nombre: string;
  total: number;
};

export type ResumenMensual = {
  total: number;
  porCategoria: FilaCategoria[];
};

export function mesBogota(iso: string): string {
  const time = new Date(iso).getTime();
  // UTC-5: restar 5 horas (18_000_000 ms)
  const bogotaDate = new Date(time - 5 * 3600 * 1000);
  const anio = bogotaDate.getUTCFullYear();
  const mes = String(bogotaDate.getUTCMonth() + 1).padStart(2, '0');
  return `${anio}-${mes}`;
}

export function resumenMensual(
  gastos: Gasto[],
  categorias: Categoria[],
  mes: string
): ResumenMensual {
  const mapaCategorias = new Map<string, string>();
  for (const cat of categorias) {
    mapaCategorias.set(cat.id, cat.nombre);
  }

  let totalGlobal = 0;
  const mapaTotales = new Map<string | null, { nombre: string; total: number }>();

  for (const gasto of gastos) {
    if (mesBogota(gasto.creadoEn) !== mes) {
      continue;
    }

    totalGlobal += gasto.monto;

    const catId = gasto.categoriaId;
    const nombreCat = catId ? mapaCategorias.get(catId) : undefined;

    if (catId && nombreCat) {
      const actual = mapaTotales.get(catId);
      if (actual) {
        actual.total += gasto.monto;
      } else {
        mapaTotales.set(catId, { nombre: nombreCat, total: gasto.monto });
      }
    } else {
      const actual = mapaTotales.get(null);
      if (actual) {
        actual.total += gasto.monto;
      } else {
        mapaTotales.set(null, { nombre: 'Sin categoría', total: gasto.monto });
      }
    }
  }

  const porCategoria: FilaCategoria[] = [];
  for (const [categoriaId, datos] of mapaTotales.entries()) {
    porCategoria.push({
      categoriaId,
      nombre: datos.nombre,
      total: datos.total,
    });
  }

  porCategoria.sort((a, b) => b.total - a.total);

  return {
    total: totalGlobal,
    porCategoria,
  };
}
