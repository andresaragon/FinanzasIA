import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFinanzasStore } from './src/store/useFinanzasStore';
import LoginScreen from './src/screens/LoginScreen';
import TableroScreen from './src/screens/TableroScreen';
import MovimientosScreen from './src/screens/MovimientosScreen';
import PresupuestosScreen from './src/screens/PresupuestosScreen';
import AnalisisScreen from './src/screens/AnalisisScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const { session, inicializarSesion } = useFinanzasStore();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    inicializarSesion().finally(() => setListo(true));
  }, []);

  if (!listo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {session ? (
        <NavigationContainer>
          <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#0d9488' }}>
            <Tab.Screen name="Tablero" component={TableroScreen} />
            <Tab.Screen name="Movimientos" component={MovimientosScreen} />
            <Tab.Screen name="Presupuestos" component={PresupuestosScreen} />
            <Tab.Screen name="Análisis" component={AnalisisScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      ) : (
        <LoginScreen />
      )}
    </>
  );
}
