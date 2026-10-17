export function parsearMonto(texto: string): number | null {
  if (typeof texto !== 'string') {
    return null;
  }
  const recortado = texto.trim();
  if (recortado === '') {
    return null;
  }

  // Eliminar espacios y el símbolo $
  const limpio = texto.replace(/[\s$]/g, '');
  if (limpio === '') {
    return null;
  }

  // Solo se permiten dígitos, puntos y coma
  if (/[^\d.,]/.test(limpio)) {
    return null;
  }

  // Al menos un dígito
  if (!/\d/.test(limpio)) {
    return null;
  }

  // Máximo una coma decimal
  const partesComa = limpio.split(',');
  if (partesComa.length > 2) {
    return null;
  }

  // No puede empezar ni terminar con coma o punto
  if (
    limpio.startsWith(',') ||
    limpio.endsWith(',') ||
    limpio.startsWith('.') ||
    limpio.endsWith('.')
  ) {
    return null;
  }

  // No puede haber combinaciones consecutivas como '..', '.,', ',.'
  if (limpio.includes('..') || limpio.includes('.,') || limpio.includes(',.')) {
    return null;
  }

  // Si hay coma, la parte decimal no puede tener puntos
  if (partesComa.length === 2 && partesComa[1].includes('.')) {
    return null;
  }

  const normalizado = limpio.replace(/\./g, '').replace(',', '.');
  const valor = Number(normalizado);

  if (Number.isNaN(valor) || !Number.isFinite(valor)) {
    return null;
  }

  return valor;
}

export type ResultadoValidacion =
  | { ok: true }
  | {
      ok: false;
      errores: {
        monto?: string;
        descripcion?: string;
      };
    };

export function validarGasto(entrada: {
  monto: number | null;
  descripcion: string;
}): ResultadoValidacion {
  const errores: { monto?: string; descripcion?: string } = {};

  const montoValido =
    typeof entrada.monto === 'number' &&
    Number.isFinite(entrada.monto) &&
    entrada.monto > 0;

  if (!montoValido) {
    errores.monto = 'El monto debe ser un número mayor a cero';
  }

  const descValida =
    typeof entrada.descripcion === 'string' &&
    entrada.descripcion.trim().length > 0;

  if (!descValida) {
    errores.descripcion = 'La descripción es requerida';
  }

  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  return { ok: true };
}
