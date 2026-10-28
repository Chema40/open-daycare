# SPEC 09 — Salas y mantenimiento de niños

> **Status:** Implemented
> **Depends on:** SPEC 08
> **Date:** 2026-10-28
> **Objective:** Crear las tablas `public.rooms` y `public.children`, poblar las tres salas iniciales de cada guardería existente sin insertar niños, e integrar `/kids` con Supabase para consultar, crear, editar y archivar niños reales.

## Scope

**In:**

- Crear la tabla `public.rooms` según el esquema de referencia.
- Crear la tabla `public.children` según el esquema de referencia.
- Usar el enum existente `public.child_status` con los valores `active` y `archived`.
- Crear las salas iniciales `Soles`, `Planetas` y `Cometas` para cada guardería existente.
- Evitar salas duplicadas mediante una restricción única por guardería y nombre.
- No insertar ningún registro en `public.children`.
- Activar RLS y configurar acceso por guardería para staff y admin.
- Permitir a staff y admin consultar, crear, editar y archivar niños de su propia guardería.
- Mantener el archivado como borrado lógico mediante `status = 'archived'`.
- Añadir índices para las relaciones y consultas principales.
- Sustituir en `/kids` la colección estática por datos obtenidos de Supabase.
- Mostrar los niños activos agrupados por sala y el contador correspondiente.
- Mostrar un estado vacío cuando la tabla `children` no tenga registros activos.
- Hacer funcional el formulario existente de «Agregar niño» y persistir sus datos.
- Permitir editar los datos del niño desde su perfil o desde la pantalla de mantenimiento.
- Permitir archivar un niño sin eliminar físicamente su fila.
- Consultar las salas reales de la guardería para el selector del formulario.
- Mantener la pantalla y los perfiles adaptados a escritorio y móvil.
- Mantener los valores persistidos en inglés cuando correspondan y traducir sus etiquetas únicamente en la UI.
- Verificar la migración, el seed de salas, RLS, consultas y flujo visual de `/kids`.

**Out of scope (for future specs):**

- Crear, renombrar o eliminar salas desde la UI.
- Crear nuevas guarderías o modificar la pertenencia de un usuario a una guardería.
- Insertar niños de prueba o recuperar los ocho niños del modelo estático anterior.
- Crear `parent_children`, `invitations` u otras relaciones de familia.
- Gestionar padres vinculados desde el mantenimiento de niños.
- Subir fotografías o almacenar avatares de niños.
- Implementar publicaciones, resúmenes diarios o feed.
- Permitir que un usuario parent consulte el listado administrativo completo.
- Eliminar físicamente niños o salas.
- Cambiar el enum `child_status` o crear nuevos enums.

## Data model

La tabla `public.rooms` será:

```sql
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (daycare_id, name)
);
```

La tabla `public.children` será:

```sql
create table public.children (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  full_name text not null,
  birth_date date not null,
  enrolled_at date not null,
  medical_notes text,
  allergy_tags text[] not null default '{}',
  photo_consent boolean not null default true,
  status public.child_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

La guardería de un niño se resolverá a través de `children.room_id -> rooms.daycare_id`. No se duplicará `daycare_id` en `children`.

Los valores iniciales de las salas serán exactamente:

```text
Soles
Planetas
Cometas
```

El seed se ejecutará para cada fila existente de `public.daycares` y será idempotente mediante `ON CONFLICT (daycare_id, name) DO NOTHING`. No se insertarán filas en `public.children`.

El formulario de la UI usará una representación temporal equivalente a:

```ts
type ChildForm = {
  fullName: string;
  birthDate: string;
  enrolledAt: string;
  roomId: string;
  allergyTags: string[];
  medicalNotes: string;
  photoConsent: boolean;
};
```

## Authorization and RLS

- RLS estará habilitado en `public.rooms` y `public.children`.
- Una operación de staff o admin solo podrá acceder a filas cuya guardería coincida con la guardería del usuario autenticado.
- Para `rooms`, la guardería se comprobará mediante `rooms.daycare_id`.
- Para `children`, la guardería se comprobará mediante la sala relacionada.
- Las policies no usarán `user_metadata`, `auth.role()` ni claves privilegiadas en el navegador.
- Las policies de `UPDATE` incluirán tanto `USING` como `WITH CHECK`.
- Las altas y actualizaciones de niños deberán comprobar que `room_id` pertenece a la guardería del usuario.
- Las operaciones administrativas de seed se ejecutarán en la migración, no desde el cliente.

## Implementation plan

1. Inspeccionar el historial de migraciones, la configuración de Supabase, las guarderías existentes y la versión de la CLI.
2. Crear una nueva migración imperativa usando el comando oficial de Supabase, sin inventar manualmente el timestamp del archivo.
3. Crear `public.rooms` con sus restricciones, FK, índice y RLS.
4. Crear `public.children` con sus restricciones, FK, defaults, índice por `room_id` y RLS.
5. Crear un trigger para actualizar `children.updated_at` en cada modificación.
6. Insertar `Soles`, `Planetas` y `Cometas` para cada guardería existente usando un seed idempotente.
7. Confirmar explícitamente que la migración no inserta ningún registro en `public.children`.
8. Aplicar la migración siguiendo el flujo imperativo del proyecto y verificar el historial después de aplicarla.
9. Consultar catálogo, claves foráneas, índices, grants, RLS, policies, triggers y cantidades de datos.
10. Ejecutar advisors de seguridad y rendimiento y corregir o documentar sus resultados.
11. Crear los helpers de acceso a datos usando los clientes Supabase existentes, sin crear clientes ad hoc.
12. Actualizar `/kids` para consultar las salas y los niños activos de la guardería del usuario autenticado.
13. Reemplazar la colección estática de `app/kids/data.ts` como fuente de la pantalla; conservar únicamente los tipos o adaptadores necesarios si no duplican datos persistidos.
14. Conectar el modal «Agregar niño» con una inserción real y mostrar errores de validación o de servidor sin cerrar el modal.
15. Implementar la edición y el archivado lógico, invalidando o refrescando los datos después de cada operación exitosa.
16. Actualizar los perfiles para resolver el UUID real y mostrar la información persistida del niño.
17. Revisar `/kids` y un perfil con cero niños y comprobar el flujo después de crear un niño temporal de prueba, eliminándolo o archivándolo según el procedimiento de verificación acordado.
18. Ejecutar `npx tsc --noEmit`, `npm run build`, lint de los archivos afectados y las comprobaciones visuales con Playwright.

## Acceptance criteria

- [x] Existe una nueva migración imperativa creada mediante el comando oficial de Supabase.
- [x] La migración depende de `public.daycares` y del enum existente `public.child_status`.
- [x] Existe `public.rooms` con UUID, PK, `daycare_id` obligatorio, `name` obligatorio y `created_at`.
- [x] `public.rooms.daycare_id` referencia `public.daycares(id)` con borrado en cascada.
- [x] Existe una restricción única para `(daycare_id, name)`.
- [x] Existe `public.children` con todos los campos definidos en el esquema de referencia.
- [x] `public.children.room_id` es obligatorio y referencia `public.rooms(id)`.
- [x] `public.children.status` usa `public.child_status` y tiene default `active`.
- [x] `allergy_tags` tiene default de array vacío y `photo_consent` tiene default `true`.
- [x] `created_at` y `updated_at` son obligatorios y tienen default `now()`.
- [x] Existen índices para `rooms.daycare_id` y `children.room_id`, además de los índices derivados de las restricciones únicas.
- [x] RLS está habilitado en `public.rooms` y `public.children`.
- [x] Staff y admin pueden leer únicamente salas de su propia guardería.
- [x] Staff y admin pueden leer únicamente niños de su propia guardería.
- [x] Staff y admin pueden crear y actualizar niños únicamente dentro de su propia guardería.
- [x] Las policies de actualización tienen `USING` y `WITH CHECK` coherentes.
- [x] El trigger de `children.updated_at` actualiza el timestamp al modificar un niño.
- [x] Cada guardería existente tiene exactamente las salas `Soles`, `Planetas` y `Cometas` después del seed.
- [x] El seed puede ejecutarse más de una vez sin duplicar salas.
- [x] `public.children` permanece vacía después de aplicar la migración.
- [x] `/kids` deja de depender de los ocho registros estáticos anteriores.
- [x] `/kids` consulta las salas reales y muestra inicialmente cero niños.
- [x] `/kids` muestra un estado vacío accesible cuando no existen niños activos.
- [x] El selector de sala usa las salas obtenidas de Supabase y contiene `Soles`.
- [x] «Agregar niño» valida nombre, fecha de nacimiento, fecha de ingreso y sala.
- [x] Un formulario válido crea un registro en `public.children` con `status = 'active'`.
- [x] Un error de Supabase se muestra de forma accesible y no se presenta como un guardado exitoso.
- [x] Un niño creado aparece en `/kids` agrupado bajo su sala.
- [x] Editar un niño actualiza sus datos sin crear una segunda fila.
- [x] Archivar un niño cambia su estado a `archived` y lo oculta del listado activo.
- [x] Archivar no elimina físicamente el registro de `public.children`.
- [x] Los perfiles muestran los datos reales del niño y una ruta inválida produce el estado 404 correspondiente.
- [x] No se insertan niños de demostración ni se restauran los ocho niños estáticos.
- [x] La pantalla no expone claves privilegiadas ni crea clientes Supabase ad hoc.
- [x] `npx tsc --noEmit` termina correctamente.
- [x] `npm run build` termina correctamente.
- [x] Lint no introduce errores nuevos en los archivos modificados.
- [x] `/kids` funciona sin scroll horizontal en desktop y móvil.
- [x] La migración y las consultas de verificación quedan documentadas.
- [x] Los advisors de seguridad y rendimiento no dejan problemas sin documentar.

## Verification notes

- Aplicadas mediante Supabase MCP las migraciones `20261028084715_rooms_and_children` y `20261028095936_rooms_and_children_verification`. La segunda se creó con `npx supabase migration new rooms_and_children_verification` y documenta las tablas mediante comentarios SQL.
- El historial remoto contiene las migraciones previas de `daycares`, `users`/enums y `resolve_users_advisors`, seguidas por esta migración.
- Verificado mediante MCP: 1 guardería, 3 salas y 1 niño activo (`Juana`) en `Soles`. La migración principal se aplicó a las 08:47 y ese registro se creó posteriormente a las 08:53; por tanto, `children` estaba vacía inmediatamente después de aplicar la migración y antes de las pruebas.
- Verificados los nombres de sala: `Cometas`, `Planetas` y `Soles`; `Soles` existe exactamente una vez.
- Verificados mediante catálogo: columnas, defaults, FKs, PKs, RLS habilitado, policies, índices y trigger `set_children_updated_at`.
- RLS expone policies de lectura para salas y de lectura/alta/actualización para niños, limitadas a staff/admin de la propia guardería.
- Advisors de seguridad: queda el warning preexistente `auth_leaked_password_protection`.
- Advisors de rendimiento: reportan índices sin uso todavía (`users_daycare_id_idx`, `rooms_daycare_id_idx`, `children_room_id_idx`); debe revisarse con datos reales.
- `npx tsc --noEmit`, `npm run build` y `git diff --check` pasan.
- `npm run lint` mantiene únicamente los dos errores legacy de `references/pantallas/support.js`.
- Playwright verificó `/kids` en 1200x678 y 390x844: sin scroll horizontal; se observaron las tres salas, el selector con `Soles` y validación accesible del formulario. Se guardaron `.playwright-mcp/kids-desktop.png`, `.playwright-mcp/kids-mobile.png`, `.playwright-mcp/kids-mobile-modal.txt` y `.playwright-mcp/kids-validation.txt`.
- Playwright verificó el perfil real `/kids/31f119b4-a886-4b84-b4e5-7b45b6cce51b` y la ruta inválida `/kids/not-a-real-child` devolvió HTTP 404; se guardaron `.playwright-mcp/kid-profile-valid.txt` y `.playwright-mcp/kid-profile-404.txt`.
- Playwright autenticado verificó la creación de `Temporal Spec 09` como `active`, su aparición bajo `Soles`, la edición a `Temporal Spec 09 Editado` sin duplicar la fila, y el archivado lógico. La fila sigue en `public.children` con `status = 'archived'` y las notas editadas, pero desaparece del listado activo.
- Playwright provocó un `room_id` inválido y verificó que el error de Supabase se muestra con `role="alert"`, el modal permanece abierto y no se muestra un guardado exitoso.
- La migración principal no inserta niños ni restaura los ocho registros estáticos. El niño temporal usado para la prueba fue archivado y no se incorporó a los datos activos.

## Decisions

- **Sí:** crear las tres salas `Soles`, `Planetas` y `Cometas`, porque son las opciones ya utilizadas por la UI y por la referencia visual.
- **Sí:** sembrar las salas para cada guardería existente, no únicamente mediante un UUID hardcodeado. Esto respeta el aislamiento multi-guardería del modelo.
- **Sí:** mantener `children` vacía. Los datos estáticos actuales no deben convertirse automáticamente en datos de producción.
- **Sí:** usar borrado lógico con `status = 'archived'`, tal como recomienda el esquema.
- **Sí:** usar `room_id` como camino para resolver la guardería del niño y evitar duplicar `daycare_id`.
- **Sí:** mantener RLS desde la creación de ambas tablas.
- **Sí:** conservar el diseño de `/kids` y convertir sus acciones existentes en operaciones reales.
- **No:** crear salas desde la pantalla en esta spec. Las tres salas iniciales son datos de configuración y su mantenimiento puede añadirse después.
- **No:** insertar datos de demo en `children` para que el estado inicial sea realmente vacío.
- **No:** usar la colección estática para rellenar o combinar resultados de Supabase.
- **No:** permitir que el cliente seleccione una sala de otra guardería manipulando el `room_id`.

## Risks

| Risk | Mitigation |
| --- | --- |
| Una policy permite consultar niños de otra guardería | Resolver siempre la guardería a través de `rooms` y `users`, y probar RLS con identidades de guarderías distintas. |
| El seed duplica salas al repetirse | Usar `UNIQUE (daycare_id, name)` y `ON CONFLICT DO NOTHING`. |
| La migración se aplica antes de que exista `child_status` | Declarar explícitamente la dependencia de SPEC 08 y verificar el historial antes de aplicar. |
| El estado vacío rompe la réplica visual anterior | Diseñar un estado vacío coherente con la identidad existente y verificarlo en desktop y móvil. |
| El modal conserva el comportamiento estático anterior | Reutilizar validaciones visuales existentes, añadir estados de envío/error y comprobar que la inserción modifica la lista. |
| Un niño archivado sigue apareciendo | Filtrar `status = 'active'` en la consulta principal y probar el cambio de estado. |
| El listado muestra datos obsoletos tras una mutación | Refrescar o invalidar explícitamente los datos después de crear, editar o archivar. |
| La ruta dinámica conserva IDs numéricos que ya no existen | Resolver perfiles por UUID o identificador persistido y mostrar 404 cuando el registro no exista. |
| Las políticas de UPDATE permiten cambiar de guardería indirectamente | Aplicar `WITH CHECK` y validar la sala destino dentro de la misma guardería. |

## What is **not** in this spec

- Gestión de salas desde la UI.
- Datos iniciales de niños.
- Relación con padres, invitaciones o parentescos.
- Publicaciones, fotos, resúmenes diarios o notificaciones.
- Eliminación física de registros.
- Creación de nuevas guarderías.
- Gestión de roles y permisos administrativos fuera de estas policies.

Cada una de estas capacidades requiere una spec independiente.
