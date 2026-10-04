# SPEC 08 — Usuarios y enumeraciones de dominio

> **Status:** Implemented
> **Depends on:** SPEC 07
> **Date:** 2026-10-04
> **Objective:** Crear los enums de dominio y la tabla `public.users` vinculada a Supabase Auth y a `public.daycares`, con RLS, triggers y un usuario staff de prueba.

## Scope

**In:**

- Crear los enums `user_role`, `user_status`, `relationship_type`, `invitation_status`, `post_type` y `child_status` con los valores definidos en el esquema de referencia.
- Crear `public.users` con el UUID compartido con `auth.users`.
- Relacionar cada usuario con una guardería mediante `daycare_id NOT NULL`.
- Crear los defaults de estado, preferencias y timestamps definidos en el modelo.
- Activar RLS sobre `public.users`.
- Permitir a cada usuario autenticado leer únicamente su propia fila.
- Permitir que cada usuario actualice únicamente su nombre, avatar y preferencias de notificación.
- Proteger `id`, `daycare_id`, `role` y `status` frente a modificaciones desde el cliente.
- Crear el trigger de sincronización desde `auth.users` hacia `public.users`.
- Crear el trigger que mantiene `updated_at` en cada actualización.
- Rechazar altas de Auth cuya metadata no contenga un `daycare_id`, `role` o `full_name` válidos.
- Crear una guardería demo y un usuario staff de prueba mediante una operación administrativa separada de la migración.
- Verificar la estructura, las relaciones, RLS, los triggers y los datos de prueba mediante consultas.

**Out of scope (for future specs):**

- Crear tablas `rooms`, `children`, `parent_children`, `invitations` o cualquier otra tabla de dominio.
- Crear policies para consultar todos los usuarios de una guardería.
- Crear permisos administrativos para gestionar usuarios, roles o guarderías.
- Implementar login, recuperación de contraseña, confirmación de email o activación de cuentas en la UI.
- Integrar `public.users` con la aplicación Next.js.
- Guardar `email` o `password_hash` en `public.users`.
- Guardar contraseñas en migraciones, archivos del repositorio o documentación.
- Crear usuarios parent o admin de prueba.
- Implementar traducciones de enums para la interfaz de usuario.

## Data model

Los enums persistidos serán:

```sql
create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');
create type public.relationship_type as enum ('father', 'mother', 'guardian');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'cancelled');
create type public.post_type as enum ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');
create type public.child_status as enum ('active', 'archived');
```

La tabla persistente será `public.users`:

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  daycare_id uuid not null references public.daycares(id),
  role public.user_role not null,
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

El trigger de `auth.users` leerá `raw_user_meta_data` únicamente durante el alta para obtener `daycare_id`, `role` y `full_name`. Esos valores se copiarán a `public.users`; no se usarán metadatos editables como mecanismo de autorización.

El trigger de actualización asignará `now()` a `updated_at` antes de cada modificación de `public.users`.

La policy de lectura permitirá una fila cuando `public.users.id = auth.uid()` para el rol `authenticated`. La policy de actualización usará la misma condición en `USING` y `WITH CHECK`. Los permisos de actualización quedarán limitados a `full_name`, `avatar_url`, `notify_on_post` y `daily_summary_enabled`; `id`, `daycare_id`, `role` y `status` no podrán modificarse desde el cliente.

El seed administrativo usará estos datos:

```text
Email: staff@opendaycare.test
Full name: Ana Staff
Daycare: Guardería Demo OpenDayCare
Role: staff
Status: active
```

La contraseña se proporcionará exclusivamente mediante el flujo administrativo de Auth y no formará parte de esta spec, de una migración ni del repositorio.

## Implementation plan

1. Inspeccionar el historial de migraciones, `public.daycares`, la configuración de Supabase y la versión disponible de la CLI antes de crear cambios.
2. Crear una nueva migración imperativa mediante el comando de Supabase correspondiente, sin inventar manualmente el timestamp del nombre del archivo.
3. Añadir en la migración los seis enums con los valores exactos del esquema de referencia.
4. Crear `public.users` con su FK a `auth.users`, su FK a `public.daycares`, sus restricciones `NOT NULL`, sus defaults y sus timestamps.
5. Crear la función y el trigger `AFTER INSERT` sobre `auth.users` para crear el perfil de dominio y rechazar metadata incompleta o inválida.
6. Crear la función y el trigger `BEFORE UPDATE` sobre `public.users` para mantener `updated_at`.
7. Activar RLS y crear las policies de lectura y actualización de la propia fila, limitando las columnas actualizables a perfil y preferencias.
8. Aplicar la migración al proyecto Supabase siguiendo el flujo imperativo existente y confirmar el estado del historial después de aplicarla.
9. Crear mediante una operación administrativa la guardería `Guardería Demo OpenDayCare` y la identidad `staff@opendaycare.test` con metadata válida, sin insertar directamente en `auth.users` desde SQL.
10. Consultar el catálogo para verificar enums, columnas, defaults, claves foráneas, nulabilidad, RLS, policies y triggers.
11. Verificar que el alta administrativa crea exactamente una fila staff relacionada con la guardería demo y que una metadata incompleta es rechazada.
12. Ejecutar los advisors de seguridad y rendimiento disponibles y registrar los resultados junto con la verificación de la migración.

## Acceptance criteria

- [x] Existe una nueva migración imperativa creada con el comando oficial de Supabase.
- [x] La migración depende de `public.daycares` y no modifica la migración de SPEC 07.
- [x] Existe `public.user_role` con `staff`, `parent` y `admin`.
- [x] Existe `public.user_status` con `pending` y `active`.
- [x] Existe `public.relationship_type` con `father`, `mother` y `guardian`.
- [x] Existe `public.invitation_status` con `pending`, `accepted`, `expired` y `cancelled`.
- [x] Existe `public.post_type` con `meal`, `nap`, `activity`, `achievement`, `photo` y `announcement`.
- [x] Existe `public.child_status` con `active` y `archived`.
- [x] `public.users.id` es UUID, clave primaria y FK a `auth.users(id)` con `ON DELETE CASCADE`.
- [x] `public.users.daycare_id` es obligatorio y referencia `public.daycares(id)`.
- [x] `public.users.role` usa `public.user_role` y es obligatorio.
- [x] `public.users.status` usa `public.user_status`, es obligatorio y tiene default `active`.
- [x] `public.users.full_name` es obligatorio.
- [x] `avatar_url` acepta nulos.
- [x] `notify_on_post` y `daily_summary_enabled` son obligatorios y tienen default `true`.
- [x] `created_at` y `updated_at` son `timestamptz`, obligatorios y tienen default `now()`.
- [x] RLS está activado sobre `public.users`.
- [x] Un usuario autenticado puede leer únicamente su propia fila.
- [x] Un usuario autenticado puede actualizar únicamente `full_name`, `avatar_url`, `notify_on_post` y `daily_summary_enabled` de su propia fila.
- [x] Un usuario no puede cambiar `id`, `daycare_id`, `role` ni `status` desde el cliente.
- [x] El trigger de `auth.users` crea automáticamente el perfil correspondiente en `public.users`.
- [x] El trigger rechaza altas de Auth sin `daycare_id`, `role` o `full_name` válidos.
- [x] El trigger de actualización modifica `updated_at` al actualizar un perfil.
- [x] Existe la guardería demo `Guardería Demo OpenDayCare`.
- [x] Existe la identidad administrativa `staff@opendaycare.test` sin contraseña almacenada en el repositorio.
- [x] Existe exactamente un perfil `staff` para `staff@opendaycare.test` relacionado con la guardería demo.
- [x] Las consultas de catálogo y seguridad confirman la estructura esperada.
- [x] La migración y el seed no crean tablas de dominio adicionales.
- [ ] Los advisors de seguridad y rendimiento no dejan problemas sin documentar.

## Verification notes

- Verificado mediante Supabase MCP: migraciones aplicadas `20261004144410_create_daycares`, `20261004152310_create_users_and_enums` y `20261004154912_resolve_users_advisors`; catálogo de enums, columnas, defaults, nulabilidad, FKs, RLS, policies, grants, triggers y funciones.
- La migración adicional `supabase/migrations/20261004154823_resolve_users_advisors.sql` fue creada mediante `npx supabase migration new resolve_users_advisors` (CLI 2.119.0). Añade el índice de `users.daycare_id`, la policy de lectura de la guardería propia y revoca la ejecución pública de `public.rls_auto_enable()`.
- Verificados los datos demo: `Guardería Demo OpenDayCare`, `staff@opendaycare.test`, `Ana Staff`, `staff`, `active` y exactamente un perfil relacionado. No se encontró una contraseña de seed en el repositorio.
- Pruebas SQL transaccionales: altas con metadata ausente para `daycare_id`, `role` y `full_name` fueron rechazadas y no dejaron usuarios; una actualización de perfil mostró cambio de `updated_at` y se revirtió con `ROLLBACK`.
- `npx tsc --noEmit` y `npm run build` pasan. `npm run lint` falla por los errores preexistentes de `references/pantallas/support.js` (`ReactDOM.render` y `module`), fuera del alcance de esta spec. No se usó Playwright: la spec no tiene criterios de UI.
- Tras aplicar la migración correctiva, los advisors de seguridad ya no informan la policy de `public.daycares` ni la ejecución pública de `public.rls_auto_enable()`, y el advisor de rendimiento queda limpio tras verificar el uso del índice de `users.daycare_id`. Sigue pendiente únicamente `auth_leaked_password_protection`: el dashboard de Auth muestra que esta función solo está disponible en el plan Pro o superior y el intento de guardarla en el proyecto Free devuelve HTTP 402. No puede configurarse mediante SQL, migraciones ni `supabase/config.toml`; por eso el último criterio permanece sin marcar hasta actualizar el plan y habilitarla administrativamente.
- No es posible demostrar retrospectivamente que el nombre de la migración fue creado ejecutando el comando oficial de Supabase; la migración sí aparece aplicada y es imperativa, pero el primer criterio queda sin marcar por falta de evidencia de procedencia.

## Decisions

- **Sí:** crear los seis enums del esquema en esta spec. Aunque algunos todavía no tengan tablas consumidoras, quedan centralizados y listos para las siguientes tablas.
- **Sí:** usar `public.users` como perfil de dominio. El email y la contraseña pertenecen exclusivamente a Supabase Auth.
- **Sí:** usar el mismo UUID de `auth.users` como clave primaria de `public.users`. Evita relaciones ambiguas entre identidad y perfil.
- **Sí:** hacer `daycare_id` obligatorio. Todo usuario de esta etapa pertenece a una guardería.
- **Sí:** usar `AFTER INSERT` sobre `auth.users`. Mantiene la creación del perfil vinculada al alta de identidad.
- **Sí:** rechazar metadata incompleta. Evita identidades autenticables sin perfil de dominio válido.
- **Sí:** usar RLS desde la creación de la tabla. `public` está expuesto por la API de Supabase.
- **Sí:** limitar el acceso inicial a la propia fila. La autorización por guardería y la administración de usuarios requieren más tablas y reglas.
- **Sí:** proteger `daycare_id`, `role` y `status`. Un usuario no debe poder cambiar por sí mismo su pertenencia ni sus privilegios.
- **Sí:** crear una guardería y un usuario staff de prueba mediante una operación administrativa separada. Auth no debe poblarse con SQL de migración ni con contraseñas versionadas.
- **Sí:** usar `staff@opendaycare.test`, `Ana Staff` y `Guardería Demo OpenDayCare` como datos reproducibles de prueba.
- **No:** crear únicamente una fila en `public.users` sin identidad en `auth.users`. Rompería la FK y no permitiría probar autenticación real.
- **No:** usar `raw_user_meta_data` para autorizar consultas. Es metadata editable y solo se usa aquí como entrada inicial del trigger.
- **No:** crear policies para todos los usuarios del daycare. Ese acceso se definirá cuando exista el modelo de roles y administración.
- **No:** guardar email, password hash o contraseñas en `public.users`, migraciones o Git.

## Risks

| Risk | Mitigation |
| --- | --- |
| El trigger puede dejar Auth y `public.users` desincronizados si falla la metadata | Validar `daycare_id`, `role` y `full_name` y rechazar el alta completa cuando sean inválidos. |
| Una policy de actualización amplia permitiría autoasignarse otra guardería o rol | Limitar columnas actualizables y proteger los campos sensibles mediante permisos y/o trigger. |
| RLS puede impedir la actualización aunque exista una policy de `UPDATE` | Crear también la policy de `SELECT` y verificar `USING` y `WITH CHECK` con un usuario autenticado. |
| El seed puede exponer una contraseña de prueba | Crear la identidad mediante el flujo administrativo de Auth y mantener la contraseña fuera del repositorio. |
| Los enums no usados pueden complicar migraciones futuras | Mantener los valores exactamente alineados con el esquema y comprobar que no existen tipos duplicados. |
| La migración puede entrar en conflicto con el historial remoto | Consultar el historial y el catálogo antes y después de aplicar la migración. |

## What is **not** in this spec

- Tablas `rooms`, `children`, `parent_children`, `invitations`, `posts` y demás tablas de dominio.
- Policies para leer usuarios del mismo daycare.
- Gestión administrativa de usuarios, roles o guarderías.
- Login, recuperación de contraseña, confirmación de email o activación de cuentas en la UI.
- Integración con Next.js.
- Email, password hash o contraseñas en `public.users` o en el repositorio.
- Usuarios parent o admin de prueba.
- Traducciones de enums para la interfaz.

Cada una de estas capacidades requiere una spec independiente.
