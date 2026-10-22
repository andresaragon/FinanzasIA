# FinanzasIA

[English](README.md) | Español

FinanzasIA es una aplicación Android de finanzas personales para Colombia, desarrollada con Expo SDK 57, React Native, TypeScript y Supabase.

## Estado actual

La **Fase 1** permite registrar gastos manualmente y consultar el total mensual agrupado por categoría. La aplicación incluye pantallas de registro e inicio de sesión por correo con Supabase. Las pantallas de análisis y presupuestos son una interfaz inicial: todavía no se generan análisis con IA ni se pueden administrar presupuestos. El registro de gastos es por texto; no hay captura por voz o foto.

## Ejecutar localmente

Requisitos: Node.js/npm y un dispositivo Android o emulador compatible con Expo. Se necesitan credenciales de Supabase para usar la autenticación y los datos.

```sh
npm install
npm start
npm test
```

Antes de iniciar la app, configura `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en un archivo `.env` local. Usa las credenciales de tu propio proyecto Supabase; no subas `.env` al repositorio.

## Estructura del proyecto

- `src/screens/` — pantallas de acceso, movimientos, tablero mensual, análisis y presupuestos.
- `src/lib/` — cliente de Supabase, validación de entrada, formato COP y utilidades del resumen mensual.
- `src/store/` — estado Zustand y operaciones de datos con Supabase.
- `src/types/` — tipos compartidos de TypeScript.
- `supabase/schema.sql` — esquema de base de datos, políticas de seguridad por fila y categorías globales predeterminadas.

## Licencia

MIT. Consulta [LICENSE](LICENSE).
