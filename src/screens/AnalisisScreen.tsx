import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';

export default function AnalisisScreen() {
  const insightIA = useFinanzasStore((s) => s.insightIA);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Análisis con IA</Text>
      <Text style={styles.texto}>
        {insightIA?.resumen ?? 'Registra algunos gastos para ver tu primer análisis.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  texto: { fontSize: 15, color: '#333', lineHeight: 22 },
});
