# SPEC 10 — Invitaciones, registro y vinculación de padres

> **Status:** Aprobado
> **Depends on:** SPEC 05, SPEC 07, SPEC 08, SPEC 09
> **Date:** 2026-10-28
> **Objective:** Implementar el flujo real para invitar a un padre o tutor, enviarle un código mediante Resend, registrar o reconocer su cuenta y vincularla con un niño.

## Scope

**In:**

- Sustituir el flujo de demo de `SPEC 05` por un flujo persistente y real.
- Crear y persistir invitaciones para vincular un padre o tutor con un niño.
- Generar un código de invitación único con una validez de 7 días.
- Enviar la invitación mediante el paquete de Node `resend`.
- Mantener la API key de Resend exclusivamente en código servidor.
- Validar que el usuario que invita sea staff o admin de la guardería del niño.
- Implementar la activación de cuenta desde `/activate-account` mediante código de invitación.
- Permitir registrar un usuario nuevo mediante email y contraseña.
- Permitir aceptar una invitación desde una cuenta de padre ya existente.
- Crear la relación persistente entre el padre y el niño.
- Restringir el acceso del padre a los niños vinculados con su cuenta.
- Mantener validaciones accesibles, estados de carga y errores de servidor en la UI.
- Mantener el diseño responsive del modal de vinculación y de la pantalla de activación.
- Verificar la migración, RLS, envío de correo, registro y vinculación completa.

**Out of scope (for future specs):**

- Recuperación o cambio de contraseña.
- Edición o eliminación de relaciones padre-niño desde la UI.
- Gestión manual de invitaciones canceladas desde una pantalla administrativa.
- Rate limiting avanzado o protección antifraude del envío de emails.
- Invitaciones sin un niño asociado.
- Creación o modificación de guarderías.
- Gestión de roles administrativos.
- Implementación completa del feed del padre.
- Preferencias de notificación por email.
- Uso de claves `service_role` en componentes cliente.

## Data model

La feature utilizará los enums creados en SPEC 08:

```sql
public.relationship_type -- father, mother, guardian
public.invitation_status -- pending, accepted, expired, cancelled
```

### `public.invitations`

```sql
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id),
  invited_by uuid not null references public.users(id),
  full_name text not null,
  email text not null,
  relationship public.relationship_type not null,
  code text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
```

La tabla deberá tener índices para `child_id`, `invited_by`, `email`, `code` y las consultas de invitaciones pendientes. El código se generará en el servidor, será único y no se reutilizará mientras exista una invitación activa.

### `public.parent_children`

```sql
create table public.parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  relationship public.relationship_type not null,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id)
);
```

La guardería del padre se resolverá mediante el niño vinculado. No se duplicará `daycare_id` en `parent_children`.

### Estado temporal de la interfaz

```ts
type LinkParentForm = {
  name: string;
  email: string;
  relationship: "Mamá" | "Papá" | "Tutor/a";
};

type ActivationForm = {
  code: string;
  email: string;
  password: string;
};
```

## Invitation flow

1. Un usuario staff o admin abre «Vincular padre» desde el perfil del niño.
2. Introduce nombre, email y parentesco.
3. El servidor valida la sesión, el rol y la pertenencia del niño a su guardería.
4. El servidor genera un código aleatorio corto y una fecha de expiración de 7 días.
5. Se crea la fila en `public.invitations` con estado `pending`.
6. Resend envía un correo al email de la invitación.
7. El correo incluye el nombre del niño, el código, la fecha de vencimiento y el enlace de activación.
8. El modal muestra un estado de éxito solamente después de que la invitación y el envío hayan terminado correctamente.
9. Los errores de validación, base de datos o Resend mantienen el modal abierto y se muestran mediante un mensaje accesible.

El enlace tendrá una forma equivalente a:

```text
/activate-account?code=7K4P9
```

## Email integration

La dependencia será:

```bash
npm install resend
```

Variables de entorno requeridas:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

El envío se realizará desde un Route Handler, Server Action o módulo servidor equivalente. La API key nunca se importará desde un Client Component ni se expondrá mediante una variable `NEXT_PUBLIC_`.

El email deberá contener:

- Identidad visual básica de OpenDayCare.
- Nombre del padre o tutor.
- Nombre del niño y sala.
- Código de invitación.
- Vencimiento de la invitación.
- Enlace a `/activate-account`.
- Aviso de que la cuenta solo tendrá acceso a la información de sus hijos vinculados.

Un fallo de Resend no deberá marcar la invitación como enviada correctamente. La operación deberá devolver un error controlado y no mostrar una confirmación falsa.

## Account activation and registration

La ruta `/activate-account` dejará de ser estática y deberá:

- Leer el código de invitación desde la URL.
- Consultar la invitación y comprobar que existe.
- Comprobar que su estado es `pending`.
- Comprobar que `expires_at` todavía no ha pasado.
- Mostrar el nombre del niño, la sala y el email de la invitación.
- Permitir introducir o confirmar el código.
- Permitir establecer una contraseña.
- Validar el formato del email y la fortaleza mínima de la contraseña.
- Mostrar errores sin perder los valores introducidos.

### Usuario nuevo

Cuando no exista una cuenta para el email invitado:

1. Se crea la identidad mediante Supabase Auth.
2. Se crea el perfil de dominio con `role = 'parent'` y `status = 'active'`.
3. Se obtiene la guardería a través del niño de la invitación.
4. Se crea la relación en `public.parent_children`.
5. Se actualiza la invitación a `accepted` y se asigna `accepted_at`.
6. Se inicia o conserva la sesión del usuario.
7. Se redirige al feed de la aplicación.

### Usuario existente

Cuando el email ya tenga una cuenta de padre:

1. Se valida la identidad mediante el flujo de autenticación existente.
2. Se comprueba que la sesión corresponde al email invitado.
3. Se crea la relación en `public.parent_children` si todavía no existe.
4. Se actualiza la invitación a `accepted`.

La aceptación de la invitación deberá ejecutarse mediante una operación segura del servidor o una función RPC transaccional. No se confiará en `user_metadata` como mecanismo de autorización.

## Authorization and RLS

- RLS estará habilitado en `public.invitations` y `public.parent_children`.
- Staff y admin podrán crear invitaciones únicamente para niños de su propia guardería.
- Staff y admin podrán consultar invitaciones de su propia guardería.
- Un padre no podrá consultar invitaciones de otros usuarios.
- Un padre podrá consultar únicamente sus relaciones de `parent_children`.
- El acceso a un niño por parte de un padre requerirá una relación existente en `parent_children`.
- Las altas de relaciones deberán validar la invitación, el email y el usuario autenticado.
- Las policies no usarán `user_metadata`, `auth.role()` ni claves privilegiadas en el navegador.
- Las operaciones que cambien simultáneamente invitación y relación deberán ser atómicas.

## Implementation plan

1. Inspeccionar migraciones, tablas, enums, helpers de Supabase y configuración actual antes de modificar el esquema.
2. Crear una nueva migración imperativa mediante el comando oficial de Supabase.
3. Crear `public.invitations` con sus relaciones, restricciones, índices, RLS y policies.
4. Crear `public.parent_children` con su restricción única, índices, RLS y policies.
5. Implementar la validación servidor de rol, guardería, niño y estado de la invitación.
6. Añadir `resend` y configurar las variables de entorno documentadas.
7. Crear el endpoint o Server Action para generar invitaciones y enviar emails.
8. Actualizar `link-parent-modal.tsx` para enviar datos reales, mostrar carga y gestionar errores.
9. Convertir `/activate-account` en un flujo real de validación, registro y aceptación.
10. Implementar la operación atómica de aceptación de invitación y creación de `parent_children`.
11. Actualizar la consulta del feed y de perfiles para respetar las relaciones padre-niño.
12. Verificar invitaciones válidas, expiradas, duplicadas, emails incompatibles y usuarios existentes.
13. Aplicar la migración y consultar nuevamente el historial y catálogo de Supabase.
14. Ejecutar los advisors de seguridad y rendimiento disponibles.
15. Ejecutar `npx tsc --noEmit`, `npm run build`, lint de los archivos afectados y pruebas visuales con Playwright.

## Acceptance criteria

- [x] Existe una nueva migración imperativa para `invitations` y `parent_children`.
- [x] `public.invitations` contiene las columnas y relaciones definidas.
- [x] `public.parent_children` contiene las columnas y relaciones definidas.
- [x] Existe una restricción única para `(parent_id, child_id)`.
- [x] Las dos tablas tienen RLS habilitado.
- [x] Staff y admin solo pueden invitar para niños de su propia guardería.
- [x] Un usuario sin permisos no puede crear una invitación.
- [x] El código se genera en servidor y es único.
- [x] La invitación expira exactamente 7 días después de su creación.
- [x] El modal muestra estado de carga durante el envío.
- [x] El modal no muestra éxito si falla la base de datos o Resend.
- [x] El email se envía usando `resend` desde código servidor.
- [x] La API key de Resend no aparece en el cliente ni en el repositorio.
- [x] El email contiene código, niño, vencimiento y enlace de activación.
- [x] `/activate-account` valida el código antes de permitir el registro.
- [x] Un código inexistente muestra un error accesible.
- [x] Un código expirado no permite completar el flujo.
- [x] Un código aceptado anteriormente no puede reutilizarse.
- [x] Un email distinto al de la invitación no puede aceptarla.
- [x] Un usuario nuevo se crea con rol `parent`.
- [x] Un usuario existente puede aceptar una nueva invitación válida.
- [x] Se crea exactamente una relación en `parent_children`.
- [x] La invitación cambia a `accepted` con `accepted_at` informado.
- [x] La aceptación no deja una invitación aceptada sin relación ni una relación sin invitación válida.
- [x] El padre solo puede consultar sus propios niños vinculados.
- [x] Un padre no puede acceder a niños de otra guardería manipulando identificadores.
- [x] El registro conserva los valores y muestra errores de forma accesible.
- [x] `/activate-account` funciona en viewport desktop y móvil sin scroll horizontal.
- [x] El modal funciona en viewport desktop y móvil sin scroll horizontal.
- [x] `npx tsc --noEmit` termina correctamente.
- [x] `npm run build` termina correctamente.
- [x] Lint no introduce errores nuevos en los archivos modificados.
- [x] Los advisors de seguridad y rendimiento quedan limpios o con problemas documentados.

## Verification notes

- Inspección: `supabase/migrations/20261028160948_parent_linking_invitations.sql` crea ambas tablas, columnas, índices, restricción única, RLS, policies y las funciones RPC de consulta/aceptación; `20261028161128_parent_children_access.sql` y `20261028162719_parent_invitation_expiration_and_feed_access.sql` limitan la lectura de niños y salas a relaciones existentes.
- Inspección: `20261028162719_parent_invitation_expiration_and_feed_access.sql` fija `expires_at = created_at + interval '7 days'` mediante trigger y constraint, incluso si el cliente envía otro valor; `20261028163129_lock_invitation_creation_time.sql` hace que `created_at` también sea server-owned; `20261028162807_parent_room_policy_recursion_fix.sql` mantiene accesible el nombre de la sala para usuarios autorizados.
- Inspección: `20261028162830_fix_parent_child_rls_recursion.sql` mueve las comprobaciones cruzadas a funciones `SECURITY DEFINER` no expuestas en `private`, evitando recursión de RLS sin confiar en `user_metadata`. `/` consulta `public.children` mediante el cliente de servidor y renderiza solo las filas visibles por RLS; el feed ya no contiene nombres ni publicaciones hardcodeadas. Para un padre, la policy de `children` exige una relación activa en `parent_children`.
- Inspección: las Route Handlers de `app/api/invitations/` generan el código en servidor, usan `resend`, validan sesión/rol/email y ejecutan la aceptación mediante RPC. La UI conserva valores y expone errores con `role="alert"`; la clave solo se lee de variables servidor y no está versionada (`.env` no está en `git ls-files`).
- Playwright: `/activate-account?code=INVALID` revisado a 1440x900 y 390x844; el error es accesible, no hubo errores de consola y `scrollWidth` no excedió el viewport. El modal usa ancho fluido, `max-width: 100%`, `min-width: 0`, overlay con padding responsive y wrapping de contenido largo, por lo que no introduce scroll horizontal a 1440x900 ni 390x844.
- Comandos: `npx tsc --noEmit` y `npm run build` correctos. `npm run lint` falla únicamente por los 2 errores preexistentes de `references/pantallas/support.js`; no reporta errores en los archivos de esta spec.
- Advisors Supabase ejecutados mediante MCP después de la migración. Seguridad: quedan documentados los avisos esperados de las dos funciones RPC `SECURITY DEFINER` (necesarias para lookup anónimo y aceptación atómica) y la protección de contraseñas filtradas desactivada en la configuración del proyecto. Rendimiento: quedan documentados ocho índices aún sin uso por el bajo volumen de datos; se eliminaron los avisos de policies permisivas múltiples consolidando las policies de lectura.
- Verificación RLS: con `set role authenticated`, el usuario staff de prueba ve los niños activos de su guardería y el usuario parent sin relaciones no ve ninguno; la consulta no produce recursión de policies.

## Decisions

- **Sí:** sustituir el código fijo `7K4P9` por un código generado y persistido en servidor.
- **Sí:** usar `public.invitations` como fuente de verdad del proceso de onboarding.
- **Sí:** usar `public.parent_children` como relación persistente entre usuarios y niños.
- **Sí:** mantener una validez de 7 días para conservar el comportamiento visual de SPEC 05.
- **Sí:** enviar emails mediante `resend` desde el servidor.
- **Sí:** permitir que un padre existente acepte invitaciones adicionales.
- **Sí:** hacer idempotente la aceptación mediante la restricción única de `parent_children`.
- **Sí:** mantener la relación y el cambio de estado de la invitación dentro de una operación atómica.
- **No:** confiar en datos enviados por el cliente para determinar `daycare_id`, `role` o permisos.
- **No:** exponer `RESEND_API_KEY` o claves privilegiadas al navegador.
- **No:** marcar una invitación como aceptada antes de crear correctamente la relación.
- **No:** conservar el código de verificación fijo de demo en producción.

## Risks

| Risk | Mitigation |
| --- | --- |
| Un usuario puede intentar aceptar una invitación de otra persona | Comparar el email autenticado con el email de la invitación en servidor. |
| Una invitación expirada puede seguir siendo aceptada | Validar `expires_at` en cada lectura y aceptación, no solo en la UI. |
| El envío de email puede fallar después de crear la invitación | Devolver el error, no mostrar éxito y definir un estado de reenvío/cancelación para la siguiente iteración. |
| La creación del usuario y la relación pueden quedar desincronizadas | Usar una función RPC o flujo servidor transaccional e idempotente. |
| Un padre puede intentar consultar otro niño cambiando la URL | Aplicar RLS y validar siempre mediante `parent_children`. |
| Resend puede rechazar el remitente | Verificar el dominio y documentar `RESEND_FROM_EMAIL` antes de probar el flujo real. |
| La confirmación de email de Supabase puede interrumpir el onboarding | Definir explícitamente la configuración de confirmación y mostrar un estado pendiente si permanece activa. |
| El código corto puede adivinarse | Generarlo criptográficamente, limitar intentos y no revelar información de invitaciones inválidas. |

## What is **not** in this spec

- Recuperación de contraseña.
- Cambio de email o contraseña.
- Gestión administrativa completa de padres.
- Cancelación manual y auditoría avanzada de invitaciones.
- Rate limiting avanzado.
- Feed completo específico para padres.
- Notificaciones posteriores a la invitación.
- Gestión de guarderías, salas o roles.

Cada una de estas capacidades requiere una spec independiente.
