# SPEC 07 — Primera tabla de guarderías

> **Status:** Implemented
> **Depends on:** Ninguna
> **Date:** 2026-10-04
> **Objective:** Crear y verificar la tabla `public.daycares` mediante la migración imperativa existente de Supabase, con RLS activado y sin datos iniciales.

## Scope

**In:**

- Documentar la migración `supabase/migrations/20261004143448_create_daycares.sql` como el cambio inicial de base de datos.
- Crear la tabla `public.daycares` con `id uuid` como clave primaria y `gen_random_uuid()` como valor por defecto.
- Crear el campo obligatorio `name text`.
- Crear el campo obligatorio `created_at timestamptz` con `now()` como valor por defecto.
- Activar Row Level Security sobre `public.daycares`.
- Mantener la tabla sin policies de acceso hasta que exista `users` y pueda definirse la relación con `users.daycare_id`.
- Mantener la tabla vacía después de aplicar la migración.
- Aplicar la migración al proyecto Supabase remoto.
- Verificar mediante consultas que la tabla, sus columnas, defaults, RLS y ausencia de datos iniciales son correctos.

**Out of scope (for future specs):**

- Crear `users`, `rooms`, `children` o cualquier otra tabla del modelo.
- Crear policies para leer la guardería propia, porque dependen de `users.daycare_id`.
- Crear grants o una política de acceso público temporal.
- Insertar guarderías demo o datos seed.
- Crear funciones, triggers, enums o relaciones adicionales.
- Integrar la tabla con la aplicación Next.js.
- Implementar altas, edición o eliminación de guarderías desde la UI.

## Data model

La tabla persistente será `public.daycares`:

```sql
create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
```

La tabla debe tener las siguientes propiedades:

- `id` es la clave primaria y no acepta valores nulos.
- `name` es obligatorio y representa el nombre visible de la guardería.
- `created_at` es obligatorio y se genera automáticamente al insertar.
- RLS está activado sobre `public.daycares`.
- No existen policies de acceso en esta primera etapa.
- No se insertan filas iniciales.

## Implementation plan

1. Inspeccionar el estado actual de Supabase y confirmar que el proyecto usa migraciones imperativas, que `supabase/migrations/20261004143448_create_daycares.sql` existe y que no hay una tabla `public.daycares` incompatible.
2. Revisar la migración existente para confirmar que define únicamente `public.daycares` con `id`, `name`, `created_at` y RLS activado, sin seed ni policies provisionales.
3. Aplicar la migración pendiente al proyecto Supabase remoto usando el flujo de migraciones configurado para el proyecto.
4. Consultar el catálogo de PostgreSQL para verificar el nombre de la tabla, sus columnas, tipos, nulabilidad y valores por defecto.
5. Consultar la configuración de seguridad para verificar que RLS está activo y que no existen policies prematuras sobre `public.daycares`.
6. Ejecutar una consulta de conteo para verificar que la tabla queda vacía y registrar el resultado de la verificación en esta spec.

## Acceptance criteria

- [x] Existe `supabase/migrations/20261004143448_create_daycares.sql` como migración imperativa de esta feature.
- [x] La migración crea `public.daycares` sin depender de tablas del dominio que todavía no existen.
- [x] `public.daycares.id` es de tipo `uuid`, es la clave primaria y tiene `gen_random_uuid()` como default.
- [x] `public.daycares.name` es de tipo `text` y `NOT NULL`.
- [x] `public.daycares.created_at` es de tipo `timestamptz`, es `NOT NULL` y tiene `now()` como default.
- [x] Row Level Security está activado sobre `public.daycares`.
- [x] No existen policies sobre `public.daycares` en esta migración.
- [x] La migración no crea grants públicos ni acceso temporal para `anon` o `authenticated`.
- [x] La migración no inserta guarderías iniciales.
- [x] La migración se aplica correctamente al proyecto Supabase remoto.
- [x] Una consulta de catálogo confirma la tabla y todas sus propiedades esperadas.
- [x] Una consulta de seguridad confirma que RLS está activo y no hay policies.
- [x] Una consulta de datos confirma que `public.daycares` contiene cero filas después de la migración.
- [x] La verificación no modifica ninguna tabla o archivo fuera del alcance de esta spec.

## Verification results

- Migración local inspeccionada: `supabase/migrations/20261004143448_create_daycares.sql` solo crea `public.daycares` y activa RLS.
- Historial remoto consultado: contiene `create_daycares` con versión `20261004144410`; la tabla remota coincide con la migración local y su estado esperado.
- Consulta de catálogo ejecutada: `id uuid NOT NULL DEFAULT gen_random_uuid()`, `name text NOT NULL` y `created_at timestamptz NOT NULL DEFAULT now()`; `id` es la clave primaria.
- Consulta de seguridad ejecutada: RLS está activo, no está forzado y no existen policies sobre `public.daycares`.
- Consulta de privilegios ejecutada: no hay `GRANT` en la migración local; el remoto conserva ACLs por defecto para `anon` y `authenticated`, sin policies que permitan filas.
- Consulta de conteo ejecutada después de aplicar la migración: `public.daycares` contiene `0` filas.
- Comandos ejecutados: `npx tsc --noEmit` y `npm run build` pasan; `npm run lint` falla únicamente por dos errores preexistentes en `references/pantallas/support.js` (`ReactDOM.render` y `no-assign-module-variable`).
- No se realizaron cambios de aplicación ni de base de datos durante esta verificación; solo se actualizó esta spec.

## Decisions

- **Sí:** usar `public.daycares` como nombre de tabla. Coincide con la referencia del esquema y con la convención de Supabase del proyecto.
- **Sí:** usar UUID generado por `gen_random_uuid()`. Es la convención definida para las claves primarias del modelo.
- **Sí:** usar `created_at timestamptz not null default now()`. Permite registrar el momento de creación sin depender del cliente.
- **Sí:** activar RLS desde la primera migración. `public` está expuesto por la API de Supabase y la tabla debe quedar protegida desde su creación.
- **Sí:** dejar RLS sin policies en esta etapa. La policy de lectura propia requiere `users.daycare_id`, que pertenece a una tabla posterior.
- **Sí:** documentar la migración existente `20261004143448_create_daycares.sql`. Evita duplicar la tabla o crear un historial de migraciones conflictivo.
- **Sí:** dejar la tabla sin seed. Los datos iniciales deben crearse mediante un flujo de administración definido posteriormente.
- **No:** crear una policy pública temporal. Podría exponer todas las guarderías y tendría que eliminarse o reemplazarse después.
- **No:** crear una función auxiliar de autorización. Introduciría lógica provisional y estructuras fuera del alcance de la primera tabla.
- **No:** crear `users` junto con `daycares`. La tabla de usuarios tiene dependencias de autenticación y merece una spec independiente.
- **No:** integrar la tabla con Next.js. La integración requiere definir primero el acceso autorizado y el cliente Supabase de la aplicación.

## Risks

| Risk | Mitigation |
| --- | --- |
| Aplicar una migración ya registrada puede producir un conflicto en el historial remoto | Consultar primero el estado de migraciones y la existencia de `public.daycares` antes de aplicar cambios. |
| RLS sin policies puede hacer que ningún cliente lea la tabla | Es intencional en esta etapa; añadir la policy junto con `users.daycare_id` en una spec posterior. |
| Una policy provisional podría exponer datos entre guarderías | No crear policies ni grants temporales hasta definir la autorización por guardería. |
| El default de UUID puede depender de una extensión ausente | Verificar que `gen_random_uuid()` está disponible en el proyecto antes de aplicar la migración. |
| El estado remoto puede diferir del repositorio local | Comparar catálogo, historial de migraciones y resultado de la consulta de verificación antes de dar la feature por terminada. |

## What is **not** in this spec

- Policies para leer la guardería propia.
- Grants públicos o acceso temporal para `anon` o `authenticated`.
- Seeds o guarderías demo.
- Tabla `users` y relaciones con Supabase Auth.
- Tablas `rooms`, `children` y el resto del esquema de dominio.
- Funciones, triggers o enums adicionales.
- Integración con Next.js o con la UI.
- CRUD de guarderías.

Cada una de estas capacidades requiere una spec independiente.
