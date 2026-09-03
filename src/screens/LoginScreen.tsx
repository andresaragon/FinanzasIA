import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(true);
  const [cargando, setCargando] = useState(false);

  async function autenticar() {
    if (!email.trim() || !password) return;
    setCargando(true);
    const { error } = modoRegistro
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>FinanzasIA</Text>
      <Text style={styles.subtitulo}>Tu dinero, bajo control</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.boton} onPress={autenticar} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>{modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setModoRegistro((v) => !v)}>
        <Text style={styles.enlace}>
          {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿Sin cuenta? Regístrate'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitulo: { textAlign: 'center', color: '#666', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  boton: {
    backgroundColor: '#2e5aa6',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  enlace: { color: '#0d9488', textAlign: 'center', marginTop: 16, fontSize: 13 },
});
