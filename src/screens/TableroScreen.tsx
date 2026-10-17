import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';
import { formatearCOP } from '../lib/formato';
import { mesBogota, resumenMensual } from '../lib/resumen';

export default function TableroScreen() {
  const { gastos, categorias, cargando, cargar } = useFinanzasStore();

  useEffect(() => {
    cargar();
  }, []);

  const mesActual = mesBogota(new Date().toISOString());
  const resumen = resumenMensual(gastos, categorias, mesActual);
  const sinGastosEnMes = resumen.porCategoria.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Total del mes</Text>
      <Text testID="total-mes" style={styles.total}>
        {formatearCOP(resumen.total)}
      </Text>

      {cargando && <Text style={styles.hint}>Cargando…</Text>}

      {!cargando && sinGastosEnMes && (
        <Text style={styles.hint}>Aún no hay gastos registrados.</Text>
      )}

      <View style={styles.lista}>
        {resumen.porCategoria.map((fila) => {
          const testId = fila.categoriaId ? `cat-${fila.categoriaId}` : 'cat-sin-categoria';
          return (
            <View key={fila.categoriaId ?? 'sin-categoria'} style={styles.fila}>
              <Text testID={testId} style={styles.filaTexto}>
                {`${fila.nombre} ${formatearCOP(fila.total)}`}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { color: '#666', fontSize: 14 },
  total: { fontSize: 40, fontWeight: 'bold', marginBottom: 24 },
  hint: { color: '#999', marginTop: 12 },
  lista: { marginTop: 8 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  filaTexto: { fontSize: 15 },
});
