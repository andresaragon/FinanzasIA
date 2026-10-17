# SPEC — FinanzasIA, Fase 1: registro manual de gastos y resumen mensual

App Android (Expo SDK 57 + React Native + TypeScript + Zustand + Supabase) de finanzas personales para Colombia.

**Antes de escribir código lee la documentación versionada de Expo SDK 57** (https://docs.expo.dev/versions/v57.0.0/) tal como pide `AGENTS.md`. No uses APIs de memoria.

## Alcance
1. Utilidades puras y testeables en `src/lib/`: formato de pesos colombianos, parseo de montos, validación de un gasto y resumen mensual por categoría.
2. Store (`src/store/useFinanzasStore.ts`): conversión segura de `monto`, estado `error`, y `agregarGasto` que reporta fallos.
3. Pantalla **Movimientos**: formulario para registrar un gasto manual (monto, descripción, categoría).
4. Pantalla **Tablero**: resumen del mes actual (total y total por categoría).
5. Categorías globales por defecto sembradas en `supabase/schema.sql`.

## Fuera de alcance (no lo hagas)
- IA, voz, foto, captura de SMS/notificaciones, ingresos, presupuestos, edición o borrado de gastos.
- Cambios en `LoginScreen`, `App.tsx` o la navegación.
- Tocar el proyecto Supabase remoto o ejecutar SQL contra él: solo se edita el archivo `supabase/schema.sql`.
- Nuevas dependencias de producción. Jest ya está instalado; no cambies `package.json` ni el lockfile.
- Editar `SPEC.md` o cualquier archivo bajo `__tests__/` (son de solo lectura).

## Convenciones
- Identificadores y textos de UI en español, como el código existente.
- Todo `monto` es un `number` en pesos colombianos (COP).
- Zona horaria de negocio: **America/Bogota = UTC−5 fijo, sin horario de verano**. No uses `Intl` ni `toLocaleString` para zonas o formato de moneda: el resultado cambia entre Hermes y Node.

## Comandos
- Tests: `npx jest --ci`
- Build / typecheck: `npx tsc --noEmit`
- Lint: no hay ESLint configurado; no lo agregues.

## Criterios de aceptación

### A. `src/lib/formato.ts` — exporta `formatearCOP(monto: number): string`
- A1. `formatearCOP(1234567)` → `'$1.234.567'`; `formatearCOP(0)` → `'$0'`; `formatearCOP(950)` → `'$950'`.
- A2. Redondea al peso entero: `formatearCOP(1500.5)` → `'$1.501'`; `formatearCOP(1500.4)` → `'$1.500'`.
- A3. Negativos: `formatearCOP(-2500)` → `'-$2.500'`.
- A4. `NaN` o `Infinity` → `'$0'` (no lanza).

### B. `src/lib/validacion.ts`
Exporta `parsearMonto(texto: string): number | null` y `validarGasto(entrada: { monto: number | null; descripcion: string })`.
- B1. En `parsearMonto` el punto es separador de miles y la coma es decimal; se ignoran espacios y el símbolo `$`. `'12.500'` → `12500`; `'12500'` → `12500`; `'$ 12.500'` → `12500`; `'1.234.567'` → `1234567`; `'12.500,50'` → `12500.5`; `'3,5'` → `3.5`.
- B2. Devuelve `null` para texto vacío, solo espacios, o con letras u otros símbolos: `''`, `'  '`, `'abc'`, `'12a'`, `'1,2,3'` → `null`.
- B3. `validarGasto` devuelve `{ ok: true }` si `monto` es finito y > 0 y `descripcion` tiene texto tras `trim()`.
- B4. Si no, devuelve `{ ok: false, errores }` donde `errores.monto` (string no vacío) está presente si `monto` es `null`, `NaN`, 0 o negativo, y `errores.descripcion` (string no vacío) está presente si la descripción está vacía o solo espacios. Cada clave solo aparece si ese campo es inválido.

### C. `src/lib/resumen.ts` — exporta `mesBogota(iso: string): string` y `resumenMensual(gastos: Gasto[], categorias: Categoria[], mes: string)`
- C1. `mesBogota('2026-10-15T12:00:00Z')` → `'2026-10'`. La conversión es a UTC−5: `mesBogota('2026-10-01T03:00:00Z')` → `'2026-09'` y `mesBogota('2026-11-01T04:59:59Z')` → `'2026-10'`, mientras que `mesBogota('2026-11-01T05:00:00Z')` → `'2026-11'`.
- C2. `resumenMensual(gastos, categorias, '2026-10')` devuelve `{ total: number, porCategoria: Array<{ categoriaId: string | null; nombre: string; total: number }> }` considerando solo los gastos cuyo `mesBogota(creadoEn)` es el mes pedido.
- C3. `porCategoria` está ordenado de mayor a menor `total` y suma lo mismo que `total`. Solo incluye categorías con al menos un gasto en el mes.
- C4. Los gastos con `categoriaId` nulo, o que no existe en `categorias`, se agrupan en una sola fila con `categoriaId: null` y `nombre: 'Sin categoría'`.
- C5. Sin gastos en el mes: `{ total: 0, porCategoria: [] }`.
- C6. No muta los arreglos de entrada.

### D. `src/store/useFinanzasStore.ts`
- D1. `cargar` convierte `monto` a `number` aunque la base lo entregue como string: una fila con `monto: '1500.50'` produce un gasto con `monto === 1500.5` (lo mismo para `monto_limite` en presupuestos).
- D2. El estado incluye `error: string | null` (inicia en `null`) y una acción `limpiarError: () => void`.
- D3. `agregarGasto` con sesión inserta en `expenses` con `user_id` de la sesión, `monto`, `descripcion`, `categoria_id` y `origen`, y luego recarga los datos.
- D4. Si el insert devuelve error, `agregarGasto` pone `error` con el mensaje (`error.message`), **no** recarga los datos y la promesa se resuelve (no lanza). Si el insert tiene éxito, `error` queda en `null`.
- D5. `agregarGasto` devuelve `Promise<boolean>`: `true` si se guardó, `false` si falló o no hay sesión.
- D6. `cerrarSesion` también reinicia `error` a `null`.

### E. Pantalla Movimientos (`src/screens/MovimientosScreen.tsx`)
Debe seguir exportándose por defecto y conservar la lista de movimientos. Agrega un formulario con estos `testID`:
- `input-monto` (TextInput controlado: prop `value`, texto libre), `input-descripcion` (TextInput controlado con `value`), `categoria-<id>` (un Pressable por cada categoría del store), `btn-guardar` (Pressable), `error-monto` y `error-descripcion` (Text, solo se renderizan cuando hay error de ese campo), `error-guardado` (Text, solo se renderiza cuando `error` del store no es `null`, con ese mensaje).
- E1. Con `input-monto` = `'12.500'`, `input-descripcion` = `'Almuerzo'` y la categoría `c1` elegida, al pulsar `btn-guardar` se llama `agregarGasto` exactamente una vez con `{ monto: 12500, descripcion: 'Almuerzo', categoriaId: 'c1', origen: 'texto' }`.
- E2. Sin categoría elegida, `categoriaId` es `null` y el guardado sigue siendo válido.
- E3. Con monto inválido (p. ej. `'abc'`) o descripción vacía **no** se llama `agregarGasto` y se muestra `error-monto` y/o `error-descripcion` según corresponda.
- E4. Si `agregarGasto` resuelve `true`, los campos monto y descripción se vacían. Si resuelve `false`, conservan su valor.
- E5. La categoría elegida se marca como seleccionada en su Pressable con `accessibilityState={{ selected: true }}` (o `aria-selected`); las demás en `false`. Al montar, ninguna está seleccionada.

### F. Pantalla Tablero (`src/screens/TableroScreen.tsx`)
Debe seguir exportándose por defecto y llamando `cargar()` al montarse. Reemplaza el total global por el resumen del **mes actual** (según `mesBogota` de la fecha actual del sistema) con estos `testID`:
- `total-mes` (Text con `formatearCOP(total)` del mes) y `cat-<categoriaId>` (Text por cada fila de `porCategoria` con texto `"<nombre> <formatearCOP(total)>"`; para la fila sin categoría usa `cat-sin-categoria`).
- F1. Con gastos de octubre y septiembre de 2026 y la fecha del sistema en octubre de 2026, `total-mes` solo suma octubre.
- F2. Cada categoría con gastos en el mes aparece una vez con su total formateado.
- F3. Sin gastos en el mes (y sin `cargando`) se muestra el texto `Aún no hay gastos registrados.` y `total-mes` sigue renderizándose con `$0`. Con `cargando` en `true` ese texto no aparece.

### G. `supabase/schema.sql`
- G1. Contiene un `insert into categories` que siembra, con `user_id` nulo, estas 8 categorías globales: Alimentación, Transporte, Vivienda, Servicios, Salud, Educación, Entretenimiento, Otros.
- G2. La siembra es idempotente (se puede ejecutar dos veces sin duplicar), por ejemplo con `where not exists` o `on conflict`, y no elimina ni altera las políticas RLS existentes.

### H. Calidad general
- H1. `npx tsc --noEmit` termina sin errores.
- H2. `npx jest --ci` termina sin fallos.
- H3. No hay secretos ni claves en el diff, y `.env` no se versiona.

## Entregable
Al terminar, escribe `HANDOFF.md` según las reglas de `AGENTS.md`/"Flujo Delegado de Construcción", listando por cada criterio (A1…H3) el archivo:línea que lo cumple y cualquier duda abierta.
