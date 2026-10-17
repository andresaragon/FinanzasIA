import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFinanzasStore } from '../store/useFinanzasStore';
import { parsearMonto, validarGasto } from '../lib/validacion';

export default function MovimientosScreen() {
  const gastos = useFinanzasStore((s) => s.gastos);
  const categorias = useFinanzasStore((s) => s.categorias);
  const errorStore = useFinanzasStore((s) => s.error);
  const agregarGasto = useFinanzasStore((s) => s.agregarGasto);

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ monto?: string; descripcion?: string }>({});

  const handleGuardar = async () => {
    const montoNumerico = parsearMonto(monto);
    const resultado = validarGasto({ monto: montoNumerico, descripcion });

    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }

    setErrores({});
    const guardado = await agregarGasto({
      monto: montoNumerico!,
      descripcion: descripcion.trim(),
      categoriaId,
      origen: 'texto',
    });

    if (guardado) {
      setMonto('');
      setDescripcion('');
      setCategoriaId(null);
    }
  };

  const renderHeader = () => (
    <View style={styles.formulario}>
      <Text style={styles.titulo}>Nuevo gasto</Text>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        testID="input-monto"
        style={styles.input}
        value={monto}
        onChangeText={(text) => {
          setMonto(text);
          if (errores.monto) {
            setErrores((prev) => ({ ...prev, monto: undefined }));
          }
        }}
        placeholder="Ej: 12.500"
        keyboardType="numeric"
      />
      {errores.monto ? (
        <Text testID="error-monto" style={styles.errorTexto}>
          {errores.monto}
        </Text>
      ) : null}

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        testID="input-descripcion"
        style={styles.input}
        value={descripcion}
        onChangeText={(text) => {
          setDescripcion(text);
          if (errores.descripcion) {
            setErrores((prev) => ({ ...prev, descripcion: undefined }));
          }
        }}
        placeholder="Ej: Almuerzo"
      />
      {errores.descripcion ? (
        <Text testID="error-descripcion" style={styles.errorTexto}>
          {errores.descripcion}
        </Text>
      ) : null}

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriasContenedor}>
        {categorias.map((cat) => {
          const seleccionada = categoriaId === cat.id;
          return (
            <Pressable
              key={cat.id}
              testID={`categoria-${cat.id}`}
              accessibilityState={{ selected: seleccionada }}
              aria-selected={seleccionada}
              onPress={() => setCategoriaId(seleccionada ? null : cat.id)}
              style={[
                styles.categoriaChip,
                seleccionada && styles.categoriaChipSeleccionada,
              ]}
            >
              <Text
                style={[
                  styles.categoriaTexto,
                  seleccionada && styles.categoriaTextoSeleccionado,
                ]}
              >
                {cat.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {errorStore ? (
        <Text testID="error-guardado" style={styles.errorGuardadoTexto}>
          {errorStore}
        </Text>
      ) : null}

      <Pressable testID="btn-guardar" onPress={handleGuardar} style={styles.btnGuardar}>
        <Text style={styles.btnGuardarTexto}>Guardar</Text>
      </Pressable>

      <Text style={[styles.titulo, { marginTop: 28, marginBottom: 8 }]}>
        Historial de movimientos
      </Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={gastos}
      keyExtractor={(g) => g.id}
      ListHeaderComponent={renderHeader}
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
  formulario: { marginBottom: 16 },
  titulo: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  errorTexto: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  errorGuardadoTexto: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 8,
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 6,
  },
  categoriasContenedor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  categoriaChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  categoriaChipSeleccionada: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  categoriaTexto: { fontSize: 13, color: '#333' },
  categoriaTextoSeleccionado: { color: '#fff', fontWeight: '600' },
  btnGuardar: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnGuardarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
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
