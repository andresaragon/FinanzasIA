import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';

export default function MovimientosScreen() {
  const gastos = useFinanzasStore((s) => s.gastos);

  return (
    <FlatList
      style={styles.container}
      data={gastos}
      keyExtractor={(g) => g.id}
      ListEmptyComponent={<Text style={styles.hint}>Sin movimientos todavía.</Text>}
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          <Text style={styles.monto}>{item.monto.toFixed(2)}</Text>
        </View>
      )}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  hint: { color: '#999', marginTop: 12 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  descripcion: { fontSize: 15 },
  monto: { fontSize: 15, fontWeight: '600' },
});
