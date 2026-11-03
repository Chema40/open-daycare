<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Flujo de trabajo del proyecto

- Este es un proyecto Next.js 16.3.5 de un solo paquete con App Router; los puntos de entrada de la aplicación son `app/page.tsx`, `app/layout.tsx` y `app/globals.css`.
- Usa npm y el `package-lock.json` versionado; instala con `npm ci`.
- Los comandos disponibles son `npm run dev`, `npm run lint`, `npm run build` y `npm run start`. Este repositorio no contiene ningún script de pruebas ni configuración de CI.
- Para comprobar tipos de forma específica, ejecuta `npx tsc --noEmit`; TypeScript está configurado con el alias `@/*`, cuya raíz es el repositorio.
- `references/pantallas/` contiene HTML y capturas de referencia del producto/la interfaz, no código fuente de la aplicación; su `support.js` heredado hace que actualmente `npm run lint` informe de dos errores y varias advertencias.
- Guarda las capturas de Playwright, los registros y los artefactos relacionados en `.playwright-mcp/`; ese directorio está ignorado por git.
- Usa Context7 para consultar la documentación actual del framework cuando sea necesario verificar las API o convenciones de Next.js.

## Supabase

- Usa la skill `supabase` para cualquier tarea relacionada con Supabase, incluyendo Database, Auth, Storage, Realtime, Edge Functions, la CLI, MCP, `supabase-js`, `@supabase/ssr`, RLS, migraciones, registros o problemas de seguridad.
- La aplicación usa `@supabase/supabase-js` para las consultas a la base de datos y `@supabase/ssr` para los clientes de navegador/servidor y las sesiones basadas en cookies. Mantén ambos paquetes alineados con `package.json` y actualiza `package-lock.json` cuando los modifiques.
- Next.js no proporciona un cliente de base de datos. Usa Supabase para el acceso a datos y las API de App Router de Next.js únicamente como límite de solicitud/ejecución:
  - Los Server Components, como `app/page.tsx`, pueden llamar a `cookies()` desde `next/headers` y crear un cliente con `utils/supabase/server.ts`.
  - Los Client Components deben usar `utils/supabase/client.ts` y nunca deben recibir una clave de service role o secreta.
  - `proxy.ts` es la convención de Next.js 16 para el middleware de solicitudes y delega la actualización de sesión a `utils/supabase/middleware.ts`.
- Mantén el acceso a Supabase detrás de los helpers existentes en lugar de crear clientes ad hoc en archivos de rutas o componentes. Usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca expongas claves privilegiadas al navegador.
- Usa la skill `supabase-postgres-best-practices` antes de escribir o modificar consultas, esquemas, migraciones, índices, triggers, funciones, políticas RLS, configuración de conexiones o diagnósticos de rendimiento de PostgreSQL.
- Supabase cambia con frecuencia; verifica el changelog actual y la documentación oficial antes de implementar funcionalidades o confiar en el comportamiento de sus API, CLI, MCP o configuración.
- Verifica los cambios de Supabase con una consulta de prueba o una comprobación equivalente. Si un enfoque falla después de dos o tres intentos, deja de reintentarlo e inspecciona el error, la documentación y los registros pertinentes.
- Siempre consultar y tomar como referencia la tabla o historial de migraciones antes de manipular la base de datos, y volver a comprobarlo después para confirmar la migración aplicada y evitar conflictos de historial.
- Activa RLS en todas las tablas de un esquema expuesto y escribe políticas para el modelo de acceso real. No uses `user_metadata` para autorización, no expongas `service_role` ni claves secretas a los clientes y no uses `auth.role()` en políticas nuevas.
- En Next.js, recuerda que toda variable de entorno `NEXT_PUBLIC_` se expone al navegador; usa claves publicables en el código del cliente y conserva las claves privilegiadas en el servidor.
- Antes de modificar el esquema, inspecciona la estructura existente de la base de datos y determina si el proyecto usa esquemas declarativos o migraciones imperativas. No inventes nombres de archivos de migración; descubre los comandos y las opciones de la CLI de Supabase con `--help`.
- Ejecuta los asesores de seguridad y rendimiento de Supabase después de los cambios en la base de datos cuando estén disponibles. Prioriza el desarrollo y la verificación locales antes de aplicar cambios a un proyecto remoto.


## Skills de desarrollo guiado por especificaciones

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl esta skill para hacer las implementaciones. 
- Toda especificación relacionada con la base de datos debe crearse en `specs/database`.

## Skills instaladas

- `supabase`: guía para integraciones con Supabase, seguridad, CLI, MCP, cambios de esquema, depuración y verificación.
- `supabase-postgres-best-practices`: rendimiento de PostgreSQL, diseño de esquemas, gestión de conexiones, concurrencia, acceso a datos, monitorización, funcionalidades avanzadas y guía sobre RLS.

## Agentes del proyecto

Los agentes personalizados del proyecto se encuentran en `.opencode/agent/`:

- `acceptance-verifier`: verifica criterios de aceptación de specs mediante inspección del código, comandos del proyecto, Next.js, Playwright y evidencia visual.
- `accessibility-checker`: audita y mejora los archivos indicados según WCAG 2.2 nivel AA, priorizando HTML semántico y soluciones nativas.
- `db-migrator`: crea, valida y aplica de forma segura migraciones versionadas de la base de datos de Supabase.
- `react-best-practices`: revisa y aplica buenas prácticas actuales de React únicamente en los archivos que se indiquen explícitamente.

## Verificación

- `acceptance-verifier` (`.opencode/agent/acceptance-verifier.md`) verifica los criterios de aceptación de una spec mediante la inspección del código, los comandos del proyecto, Next.js, Playwright y evidencia visual. Actualiza únicamente las casillas de verificación y las notas de verificación de la spec.
- `/verify-spec [ruta-de-la-spec]` delega la verificación al agente `acceptance-verifier`. Si no se indica una ruta y hay varias specs, solicitar aclaración antes de continuar.

## Reglas de código

- Usa código limpio y nombres de funciones y variables en inglés.
