# FinanzasIA

English | [Español](README.es.md)

FinanzasIA is an Android personal finance app for Colombia, built with Expo SDK 57, React Native, TypeScript, and Supabase.

## Current status

**Phase 1** supports manually recording expenses and viewing a monthly total grouped by category. The app includes Supabase email sign-up and sign-in screens. Analysis and budget screens are present as early UI, but AI-generated analysis and budget management are not implemented yet. Expense entry currently supports text; voice and photo capture are not available.

## Run locally

Requirements: Node.js/npm and an Expo-compatible Android device or emulator. Supabase credentials are required to use authentication and data features.

```sh
npm install
npm start
npm test
```

Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in a local `.env` file before launching the app. Use your own Supabase project credentials; do not commit `.env`.

## Project structure

- `src/screens/` — login, movements, monthly dashboard, analysis, and budgets screens.
- `src/lib/` — Supabase client, input validation, COP formatting, and monthly summary utilities.
- `src/store/` — Zustand state and Supabase data operations.
- `src/types/` — shared TypeScript types.
- `supabase/schema.sql` — database schema, row-level security policies, and default global categories.

## License

MIT. See [LICENSE](LICENSE).
