# Proposal

## Why

OpenDayCare mezcla actualmente en las mismas rutas la experiencia del personal de la guardería y la de las familias. Aunque Supabase RLS limita parte de los datos, la navegación y las pantallas no expresan una frontera clara de autorización, lo que puede mostrar acciones de gestión fuera de contexto y dificulta mantener una experiencia segura para cada perfil.

La separación por URLs hará explícito qué producto utiliza cada perfil, reducirá el riesgo de acceso accidental a funciones de gestión y permitirá evolucionar los paneles de staff, familia y administración de forma independiente.

## What Changes

- **BREAKING**: Introducir `/staff` como área exclusiva para usuarios con rol `staff`, con feed, gestión de niños, perfiles de niños y vinculación de familias.
- **BREAKING**: Introducir `/family` como área exclusiva para usuarios con rol `parent`, centrada en el feed y la información visible de sus niños vinculados.
- Reservar `/admin` para usuarios con rol `admin` y mostrar inicialmente una pantalla placeholder de área administrativa futura.
- Redirigir `/staff` a `/staff/feed` y `/family` a `/family/feed`.
- Redirigir `/` según el rol autenticado: `staff` a `/staff/feed`, `parent` a `/family/feed` y `admin` a `/admin`.
- Mantener compatibilidad con `/kids` y `/kids/[identifier]` redirigiéndolas a sus equivalentes bajo `/staff`.
- Redirigir a cada usuario autenticado a su área propia cuando intente acceder a otra área protegida.
- Mantener `/login` y `/activate-account` como rutas públicas, y conservar la protección de sesión existente.
- Separar los layouts, navegación, textos y acciones de staff y familia, sin confiar únicamente en enlaces ocultos para controlar permisos.
- Mantener las comprobaciones existentes de APIs y RLS como defensa independiente de la protección de rutas.

## Capabilities

### New Capabilities

- `role-based-panels`: Define el enrutamiento, autorización y experiencia separada de los paneles `/staff`, `/family` y `/admin`, incluyendo redirecciones por rol y compatibilidad de rutas legacy.

### Modified Capabilities

- Ninguna. No existe una capability registrada en `openspec/specs/`; las especificaciones históricas del repositorio están fuera del inventario OpenSpec actual.

## Impact

- Rutas y layouts del App Router bajo `app/staff`, `app/family` y `app/admin`.
- Redirección inicial de `app/page.tsx` y compatibilidad de las rutas actuales de niños.
- Navegación y componentes visuales compartidos del feed y gestión de niños.
- Resolución de rol desde el perfil `public.users` y protección de rutas en el flujo SSR de Supabase.
- Pruebas de autorización, redirecciones, aislamiento de datos y navegación responsive.
- No se prevén cambios de esquema, migraciones ni nuevas credenciales.
