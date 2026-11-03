# SPEC 11 — Publicación de entradas por miembros del staff

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 07, SPEC 08, SPEC 09, SPEC 10
> **Date:** 2026-11-03
> **Objective:** Permitir que un miembro activo del staff cree publicaciones dirigidas a varios niños o a toda una sala, con título, tipo, descripción y una imagen opcional, manteniendo la visibilidad limitada a los padres destinatarios.

## Scope

**In:**

- Crear publicaciones únicamente como usuario autenticado con rol `staff` y estado `active`.
- Seleccionar uno o varios niños, o una sala completa, como destinatarios.
- Exigir título, tipo y descripción.
- Mantener los tipos `Comida`, `Siesta`, `Actividad`, `Logro`, `Ánimo`, `Foto` y `Anuncio`.
- Adjuntar cero o una imagen opcional.
- Guardar la publicación y sus relaciones en Supabase.
- Mostrar la nueva publicación inmediatamente y cargarla al volver al feed.
- Mantener la visibilidad limitada a padres de los niños destinatarios o de la sala.
- Usar un bucket privado y URLs firmadas para las imágenes.
- Mantener validaciones, estados de carga y errores accesibles.

**Out of scope:**

- Edición o eliminación de publicaciones.
- Más de una imagen, compresión, recorte o edición de imágenes.
- Definición definitiva de límites de imagen; se aplica provisionalmente un máximo técnico de 10 MB.
- Likes, comentarios, notificaciones o moderación.
- Gestión de roles, asignación de staff a salas o paginación histórica.

## Data model

La feature incorpora:

### `public.posts`

Incluye `author_id`, `room_id` nullable, `type public.post_type`, `title`, `body`, `published_at`, `created_at` y `updated_at`.

### `public.post_children`

Tabla intermedia con clave primaria compuesta `(post_id, child_id)`, usada para publicaciones dirigidas a uno o varios niños.

### `public.post_photos`

Guarda la ruta privada del objeto en Storage, la publicación, posición y fecha de creación.

### Storage

Se crea el bucket privado `post-photos`. Los objetos siguen la forma:

```text
{author_id}/{post_id}/{position}.{extension}
```

Las policies de Storage comprueban que el staff sea autor y que el padre tenga acceso al niño o sala de la publicación.

## API

### `POST /api/posts`

Recibe `multipart/form-data` con `title`, `body`, `type`, `childIds` o `roomId`, y un `photo` opcional. El servidor obtiene el usuario desde la sesión, comprueba que sea staff activo, valida destinatarios de la misma guardería y persiste los registros relacionados. No confía en `daycare_id`, `role` ni permisos enviados por el cliente.

## Implementation

1. `app/create-post-modal.tsx` implementa el formulario, selección múltiple, sala, validaciones, imagen opcional, estados de carga y foco accesible.
2. `app/api/posts/route.ts` procesa la petición autenticada, sube la imagen privada y persiste la publicación.
3. `app/page.tsx` carga niños, perfil y publicaciones visibles; genera URLs firmadas para fotos.
4. `app/home-feed.tsx` muestra los activadores solo al staff y añade la publicación creada al feed.
5. `supabase/migrations/20261103082909_staff_posts.sql` crea tablas, índices, RLS y bucket.
6. `supabase/migrations/20261103083457_post_visibility_and_mood.sql` añade `mood` y lectura para padres.
7. `supabase/migrations/20261103083515_staff_only_posts.sql` limita la creación directa a `staff`.
8. `supabase/migrations/20261103083711_room_post_visibility.sql` cubre publicaciones e imágenes dirigidas a toda una sala.

## Acceptance criteria

- [x] Un staff activo puede abrir «Nueva publicación».
- [x] Parent y admin no ven los activadores de creación.
- [x] Se pueden seleccionar varios niños.
- [x] Se puede seleccionar una sala completa y limpiar la selección individual.
- [x] Destinatario, título, tipo y descripción son obligatorios.
- [x] Se ofrecen las siete categorías definidas.
- [x] Se puede adjuntar cero o una imagen.
- [x] El servidor valida el archivo como imagen y aplica el límite técnico provisional.
- [x] La API rechaza usuarios no autenticados o que no sean staff activo.
- [x] La API rechaza niños o salas de otra guardería.
- [x] La publicación se guarda en `posts` y los destinatarios individuales en `post_children`.
- [x] La foto se guarda en el bucket privado y en `post_photos`.
- [x] La publicación aparece inmediatamente y al recargar el feed.
- [x] Un padre solo puede leer publicaciones de sus niños vinculados o sus salas.
- [x] Las imágenes se sirven mediante URLs firmadas.
- [x] Las tablas nuevas tienen RLS habilitado.
- [x] `npx tsc --noEmit` termina correctamente.
- [x] `git diff --check` termina correctamente.
- [x] Las migraciones se aplicaron y confirmaron en el historial remoto de Supabase.
- [x] Se ejecutaron los advisors de seguridad y rendimiento.
- [ ] `npm run build` termina correctamente en el entorno actual.
- [ ] El flujo completo se verifica mediante navegador con una sesión staff real.

## Verification notes

- Se inspeccionaron `users`, `rooms`, `children` y `parent_children` antes de crear las tablas.
- Las cuatro migraciones de la feature aparecen en el historial remoto de Supabase.
- El catálogo confirmó que `public.post_type` contiene `mood` además de los valores existentes.
- `npx tsc --noEmit` finaliza correctamente.
- Lint no reporta errores en los archivos de aplicación modificados; conserva únicamente los dos errores heredados de `references/pantallas/support.js`.
- `npm run build` queda bloqueado por un error preexistente de resolución de `next/font/google` con Turbopack (`@vercel/turbopack-next/internal/font/google/font`).
- Los advisors mantienen avisos previos sobre funciones `SECURITY DEFINER`, protección de contraseñas filtradas desactivada, índices aún sin uso y policies permisivas múltiples documentadas en el proyecto.

## Decisions

- **Sí:** permitir varios niños o una sala completa.
- **Sí:** exigir título, tipo y descripción.
- **Sí:** admitir una imagen opcional.
- **Sí:** usar Storage privado y URLs firmadas.
- **Sí:** restringir la creación a `staff` activo.
- **Sí:** actualizar el feed inmediatamente y después de recargar.
- **No:** confiar en el cliente para decidir guardería o permisos.
- **No:** hacer público el bucket de imágenes.

## Risks

| Risk | Mitigation |
| --- | --- |
| Publicar para otra guardería | Validación servidor y RLS sobre staff, niños y salas. |
| Compartir una URL de imagen privada | Bucket privado y URLs firmadas con duración limitada. |
| Publicación para sala expuesta a otra sala | Las policies comparan `child.room_id` con `posts.room_id`. |
| Límite de imagen insuficiente o cambiante | El máximo actual está documentado como límite técnico provisional. |
| Diferencia entre feed optimista y servidor | El feed se rellena de nuevo desde Supabase al renderizar la página. |
