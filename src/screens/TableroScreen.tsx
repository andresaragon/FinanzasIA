import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';

export default function TableroScreen() {
  const { gastos, cargando, cargar } = useFinanzasStore();

  useEffect(() => {
    cargar();
  }, []);

  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Total registrado</Text>
      <Text style={styles.total}>{total.toFixed(2)}</Text>
      {cargando && <Text style={styles.hint}>Cargando…</Text>}
      {!cargando && gastos.length === 0 && (
        <Text style={styles.hint}>Aún no hay gastos registrados.</Text>
      )}
      <View style={styles.lista}>
        {gastos.slice(0, 5).map((g) => (
          <View key={g.id} style={styles.fila}>
            <Text style={styles.filaTexto}>{g.descripcion}</Text>
            <Text style={styles.filaMonto}>{g.monto.toFixed(2)}</Text>
          </View>
        ))}
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
  filaMonto: { fontSize: 15, fontWeight: '600' },
});
