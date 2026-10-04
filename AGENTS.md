<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project workflow

- This is a single-package Next.js 16.3.5 App Router project; the application entrypoints are `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`.
- Use npm and the committed `package-lock.json`; install with `npm ci`.
- Available commands are `npm run dev`, `npm run lint`, `npm run build`, and `npm run start`. There is no test script or CI configuration in this repository.
- For focused type checking, run `npx tsc --noEmit`; TypeScript is configured with the `@/*` alias rooted at the repository root.
- `references/pantallas/` contains product/UI reference HTML and screenshots, not application source; its legacy `support.js` currently causes `npm run lint` to report two errors and several warnings.
- Keep Playwright screenshots, logs, and related artifacts under `.playwright-mcp/`; that directory is ignored by git.
- Use Context7 for current framework documentation when Next.js APIs or conventions need verification.

## Supabase

- Use the `supabase` skill for any task involving Supabase, including Database, Auth, Storage, Realtime, Edge Functions, the CLI, MCP, `supabase-js`, `@supabase/ssr`, RLS, migrations, logs, or security issues.
- Use the `supabase-postgres-best-practices` skill before writing or changing PostgreSQL queries, schemas, migrations, indexes, triggers, functions, RLS policies, connection settings, or performance diagnostics.
- Supabase changes frequently; verify the current changelog and official documentation before implementing features or relying on API, CLI, MCP, or configuration behavior.
- Verify Supabase changes with a test query or equivalent check. If an approach fails after two or three attempts, stop retrying and inspect the error, documentation, and relevant logs.
- Siempre consultar y tomar como referencia la tabla o historial de migraciones antes de manipular la base de datos, y volver a comprobarlo después para confirmar la migración aplicada y evitar conflictos de historial.
- Enable RLS on every table in an exposed schema and write policies for the actual access model. Do not use `user_metadata` for authorization, expose `service_role` or secret keys to clients, or use `auth.role()` in new policies.
- In Next.js, remember that every `NEXT_PUBLIC_` environment variable is exposed to the browser; use publishable keys in client code and keep privileged keys server-side.
- Before schema changes, inspect the existing database structure and determine whether the project uses declarative schemas or imperative migrations. Do not invent migration filenames; discover Supabase CLI commands and flags with `--help`.
- Run Supabase security and performance advisors after database changes when available. Prefer local development and verification before applying changes to a remote project.


## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl esta skill para hacer las implementaciones. 
- Toda especificación relacionada con la base de datos debe crearse en `specs/database`.

## Installed Skills

- `supabase`: guidance for Supabase integrations, security, CLI, MCP, schema changes, debugging, and verification.
- `supabase-postgres-best-practices`: PostgreSQL performance, schema design, connection management, concurrency, data access, monitoring, advanced features, and RLS guidance.

## Verification

- `acceptance-verifier` (`.opencode/agent/acceptance-verifier.md`) verifica los criterios de aceptación de una spec con inspección del código, comandos del proyecto, Next.js, Playwright y evidencia visual. Actualiza únicamente los checks y las notas de verificación de la spec.
- `/verify-spec [ruta-de-la-spec]` delega la verificación al agente `acceptance-verifier`. Si no se indica una ruta y hay varias specs, solicitar aclaración antes de continuar.

## Reglas de código

- Usar código limpio, nombres, funciones y variables en inglés
