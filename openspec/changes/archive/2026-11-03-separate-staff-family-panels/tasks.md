# Tasks

## 1. Resolución de sesión y enrutamiento por rol

- [x] 1.1 Centralizar la lectura server-side de sesión y perfil `public.users`, tratando perfiles inexistentes, inactivos o con roles no soportados como acceso no autorizado; verificar con `npx tsc --noEmit` y una navegación sin filtración de datos.
- [x] 1.2 Convertir `/` en un entrypoint que redirija `staff` a `/staff/feed`, `parent` a `/family/feed` y `admin` a `/admin`; verificar cada destino con sesiones reales o fixtures de sesión controlados.
- [x] 1.3 Crear los índices `/staff` y `/family` con redirección a sus feeds, y el placeholder autorizado `/admin`; verificar que cada rol llega solo a su destino y que los roles no autorizados no ven el contenido.
- [x] 1.4 Aplicar protección server-side en los layouts de `/staff`, `/family` y `/admin`, diferenciando sesión ausente de rol insuficiente; verificar acceso directo, recarga y navegación sin flash de contenido privado.

## 2. Panel staff y migración de gestión

- [x] 2.1 Mover el feed y sus acciones de publicación a `/staff/feed`, conservando la validación de `staff` activo y la consulta de publicaciones protegida por RLS; verificar creación rechazada para `parent` y `admin` mediante `/api/posts`.
- [x] 2.2 Mover la gestión de niños a `/staff/kids` y los perfiles a `/staff/kids/[identifier]`, manteniendo alta, edición, archivado y vinculación de padres únicamente en el contexto staff; verificar consultas y mutaciones con un usuario staff y una sesión no staff.
- [x] 2.3 Crear el layout y la navegación staff sin enlaces family incorrectos, conservando nombres accesibles, foco visible y ausencia de scroll horizontal; verificar en viewports desktop y móvil con inspección visual y Playwright.

## 3. Panel family y separación de acciones

- [x] 3.1 Crear `/family/feed` con el contenido del feed familiar y consultas limitadas a las filas visibles para el `parent` autenticado; verificar que solo aparecen niños vinculados y publicaciones autorizadas por RLS.
- [x] 3.2 Crear el layout y la navegación family sin enlaces a gestión de niños, invitaciones o creación de publicaciones; verificar la ausencia de esas acciones con una sesión parent y el estado vacío sin niños vinculados.
- [x] 3.3 Adaptar los componentes compartidos del feed para distinguir contexto staff y family sin duplicar controles de autorización; verificar que solo staff activo ve los activadores de publicación y que la UI family conserva semántica, foco y responsive.

## 4. Compatibilidad y superficies existentes

- [x] 4.1 Convertir `/kids` en una redirección a `/staff/kids` y `/kids/[identifier]` en una redirección equivalente, sin renderizar antes la página antigua; verificar URLs válidas, identificadores inválidos y acceso de parent a rutas legacy.
- [x] 4.2 Actualizar enlaces internos, login y navegación para apuntar a las nuevas áreas sin romper `/login` ni `/activate-account`; verificar que no quedan enlaces activos hacia pantallas de gestión fuera de `/staff`.
- [x] 4.3 Confirmar que las Route Handlers de invitaciones y publicaciones conservan sus comprobaciones server-side y que no se requieren cambios de migración; verificar con inspección de código, consultas autorizadas/no autorizadas y `git diff --check`.

## 5. Verificación integral

- [ ] 5.1 Ejecutar una matriz de navegación con usuarios `staff`, `parent`, `admin` y sin sesión para `/`, `/staff`, `/staff/feed`, `/staff/kids`, `/family`, `/family/feed`, `/admin`, `/kids` y `/login`; verificar los destinos esperados y ausencia de datos ajenos.
- [ ] 5.2 Verificar los estados de éxito, permisos insuficientes, perfil inválido, sesión ausente y datos vacíos con mensajes seguros y sin detalles técnicos; comprobar que las respuestas no exponen información de niños o familias no autorizadas.
- [x] 5.3 Ejecutar `npx tsc --noEmit`, `npm run build` y lint de los archivos afectados; documentar cualquier error preexistente del repositorio separándolo de los errores introducidos por el cambio. `tsc` y lint de los archivos afectados pasan; `npm run build` continúa bloqueado por el error preexistente de `next/font/google` con Turbopack.
- [ ] 5.4 Verificar con Playwright o comprobación equivalente el responsive desktop/móvil, semántica HTML, nombres accesibles, foco de teclado y ausencia de scroll horizontal en los tres paneles; guardar evidencia en `.playwright-mcp/`.
