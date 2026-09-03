export type Categoria = {
  id: string;
  nombre: string;
  icono: string | null;
};

export type Gasto = {
  id: string;
  userId: string;
  monto: number;
  descripcion: string;
  categoriaId: string | null;
  origen: 'texto' | 'voz' | 'foto';
  creadoEn: string;
};

export type Presupuesto = {
  id: string;
  categoriaId: string;
  montoLimite: number;
  mes: string; // formato YYYY-MM
};

export type InsightIA = {
  resumen: string;
  generadoEn: string;
};
