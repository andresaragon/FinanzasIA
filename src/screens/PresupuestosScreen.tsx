import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';

export default function PresupuestosScreen() {
  const presupuestos = useFinanzasStore((s) => s.presupuestos);

  return (
    <FlatList
      style={styles.container}
      data={presupuestos}
      keyExtractor={(p) => p.id}
      ListEmptyComponent={<Text style={styles.hint}>Sin presupuestos definidos.</Text>}
      renderItem={({ item }) => (
        <View style={styles.fila}>
          <Text style={styles.mes}>{item.mes}</Text>
          <Text style={styles.monto}>{item.montoLimite.toFixed(2)}</Text>
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
  mes: { fontSize: 15 },
  monto: { fontSize: 15, fontWeight: '600' },
});
