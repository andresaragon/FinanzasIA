export function formatearCOP(monto: number): string {
  if (typeof monto !== 'number' || !Number.isFinite(monto)) {
    return '$0';
  }
  const redondeado = Math.round(monto);
  if (redondeado === 0 || Object.is(redondeado, -0)) {
    return '$0';
  }
  const esNegativo = redondeado < 0;
  const absStr = Math.abs(redondeado).toString();
  const conPuntos = absStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return esNegativo ? `-$${conPuntos}` : `$${conPuntos}`;
}
