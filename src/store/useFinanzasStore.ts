import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Categoria, Gasto, InsightIA, Presupuesto } from '../types';

type FinanzasState = {
  session: Session | null;
  cargando: boolean;
  gastos: Gasto[];
  categorias: Categoria[];
  presupuestos: Presupuesto[];
  insightIA: InsightIA | null;

  inicializarSesion: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  cargar: () => Promise<void>;
  agregarGasto: (gasto: Omit<Gasto, 'id' | 'userId' | 'creadoEn'>) => Promise<void>;
};

export const useFinanzasStore = create<FinanzasState>((set, get) => ({
  session: null,
  cargando: false,
  gastos: [],
  categorias: [],
  presupuestos: [],
  insightIA: null,

  inicializarSesion: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  cerrarSesion: async () => {
    await supabase.auth.signOut();
    set({ session: null, gastos: [], categorias: [], presupuestos: [], insightIA: null });
  },

  cargar: async () => {
    const { session } = get();
    if (!session) return;
    set({ cargando: true });

    const [{ data: gastos }, { data: categorias }, { data: presupuestos }] = await Promise.all([
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('budgets').select('*'),
    ]);

    set({
      gastos: (gastos ?? []).map(mapGasto),
      categorias: (categorias ?? []).map(mapCategoria),
      presupuestos: (presupuestos ?? []).map(mapPresupuesto),
      cargando: false,
    });
  },

  agregarGasto: async (gasto) => {
    const { session } = get();
    if (!session) return;

    const { error } = await supabase.from('expenses').insert({
      user_id: session.user.id,
      monto: gasto.monto,
      descripcion: gasto.descripcion,
      categoria_id: gasto.categoriaId,
      origen: gasto.origen,
    });

    if (!error) {
      await get().cargar();
    }
  },
}));

function mapGasto(row: any): Gasto {
  return {
    id: row.id,
    userId: row.user_id,
    monto: row.monto,
    descripcion: row.descripcion,
    categoriaId: row.categoria_id,
    origen: row.origen,
    creadoEn: row.created_at,
  };
}

function mapCategoria(row: any): Categoria {
  return { id: row.id, nombre: row.nombre, icono: row.icono };
}

function mapPresupuesto(row: any): Presupuesto {
  return { id: row.id, categoriaId: row.categoria_id, montoLimite: row.monto_limite, mes: row.mes };
}
