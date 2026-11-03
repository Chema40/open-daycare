# Design

## Context

La sesión ya se actualiza mediante `proxy.ts` y `utils/supabase/middleware.ts`, pero el middleware solo distingue sesión presente o ausente. `app/page.tsx` consulta el perfil y combina datos de staff y familia en un mismo feed; `app/kids` contiene la gestión de niños y sus perfiles; las APIs de publicaciones e invitaciones ya validan roles en servidor y Supabase RLS limita los datos.

La capability `role-based-panels` requiere añadir una frontera de rutas sin duplicar las garantías existentes de API y base de datos. El cambio no necesita tablas, enums ni migraciones nuevas.

## Goals / Non-Goals

**Goals:**

- Crear áreas navegables y protegidas en `/staff`, `/family` y `/admin`.
- Resolver el destino inicial a partir de la sesión y del perfil `public.users` en servidor.
- Separar layouts, navegación y acciones de staff y familia.
- Mantener las consultas de negocio protegidas por RLS y las comprobaciones de autorización de las APIs.
- Preservar enlaces existentes mediante redirecciones legacy.
- Cubrir estados de carga, error de perfil, permisos insuficientes y datos vacíos sin exponer datos privados.
- Mantener la identidad visual, semántica accesible y comportamiento responsive actuales.

**Non-Goals:**

- Implementar funcionalidades administrativas reales en `/admin`.
- Cambiar roles, permisos de base de datos, políticas RLS o el modelo de datos.
- Crear un panel familiar de gestión de niños o invitaciones.
- Rediseñar el contenido del feed más allá de separar el contexto y las acciones por perfil.
- Implementar logout, recuperación de contraseña o nuevas capacidades de cuenta.

## Decisions

### 1. Layouts de ruta separados

Se crearán layouts propios para `app/staff`, `app/family` y `app/admin`. Cada layout resolverá la sesión y el perfil desde el servidor antes de renderizar sus hijos. `/staff` aceptará únicamente `staff`; no se tratará `admin` como staff aunque el modelo actual permita a `admin` consultar algunas entidades.

**Alternativa descartada:** conservar un único layout condicionado por `role`. Mezclaría navegación y acciones de ambos perfiles y haría más fácil olvidar una comprobación al añadir una ruta nueva.

### 2. Comprobación de rol en servidor con defensa en profundidad

El middleware seguirá renovando cookies y protegiendo rutas sin sesión. La autorización por rol se aplicará en los layouts o páginas servidor de cada área, usando el perfil almacenado en `public.users`; los componentes cliente no decidirán el rol y ningún valor enviado por el navegador podrá sobrescribirlo.

Las APIs existentes conservarán sus verificaciones independientes y RLS seguirá siendo la autoridad final para las filas visibles. Si el perfil no existe, está inactivo o no puede resolverse, se tratará como acceso no autorizado y no se renderizarán datos de negocio.

**Alternativa descartada:** hacer todas las consultas de rol en middleware. Aumentaría el acoplamiento de cada petición al acceso de datos y no sustituiría la verificación necesaria en los Server Components y Route Handlers.

### 3. Router inicial por rol

La ruta `app/page.tsx` actuará como frontera de entrada y redirigirá a `/staff/feed`, `/family/feed` o `/admin` según el perfil. Los índices `/staff` y `/family` redirigirán a sus feeds. El login conservará su redirección posterior al inicio y el destino final resolverá el rol en servidor.

Para una sesión válida cuyo perfil sea inexistente, inválido o no soportado, se mostrará un estado de acceso no disponible o se dirigirá a una ruta segura sin contenido privado; no se asumirá `parent` ni `staff` por defecto.

### 4. Compatibilidad mediante redirecciones

Las rutas actuales `/kids` y `/kids/[identifier]` se convertirán en entradas de compatibilidad hacia `/staff/kids` y `/staff/kids/[identifier]`. La autorización del destino se ejecutará igualmente, por lo que un `parent` será enviado a `/family/feed` y nunca verá la pantalla staff.

**Alternativa descartada:** mantener las páginas antiguas renderizando contenido. Duplicaría superficies protegidas y permitiría que futuras modificaciones olvidasen la separación de paneles.

### 5. Compartir primitivas, no contextos

Se podrán reutilizar componentes visuales pequeños y tipos de datos, pero cada panel tendrá un shell y una navegación explícitos. El feed staff conservará la creación de publicaciones para `staff` activo; el feed family no mostrará gestión, invitaciones ni creación. El estado vacío familiar se basará en las filas visibles para ese usuario, no en una colección global.

### 6. Estados de interfaz y permisos

- **Carga:** las consultas de sesión/perfil y datos se resolverán en servidor; los formularios cliente mantendrán sus estados de carga existentes.
- **Éxito:** cada rol llega a su feed o placeholder autorizado.
- **Permisos insuficientes:** redirección al panel propio, sin renderizar primero el contenido ajeno.
- **Sesión ausente:** redirección a `/login` para todas las áreas privadas.
- **Perfil inválido o error de autorización:** respuesta segura sin datos de guardería; el detalle técnico no se mostrará al usuario.
- **Datos vacíos:** `/family/feed` mostrará un estado vacío sin niños ni publicaciones de otras familias; `/staff/kids` conservará su estado vacío de gestión.

## Risks / Trade-offs

- **[Riesgo]** Una redirección en el cliente podría mostrar brevemente contenido ajeno. **Mitigación:** resolver autorización en layouts/páginas servidor antes del renderizado y mantener RLS.
- **[Riesgo]** La navegación compartida puede reintroducir enlaces staff en family. **Mitigación:** shells separados y pruebas de ausencia de acciones por rol.
- **[Riesgo]** Las rutas legacy pueden crear una segunda vía de acceso. **Mitigación:** convertirlas en redirecciones y verificar autorización en el destino.
- **[Riesgo]** El rol `admin` tiene permisos de datos históricos distintos a `staff`. **Mitigación:** no reutilizar automáticamente políticas de staff; reservar `/admin` y mantener fuera de scope sus funciones reales.
- **[Riesgo]** El feed actual combina consultas y copy de ambos perfiles. **Mitigación:** separar adaptadores de datos y textos por panel, compartiendo solo la presentación que no cambie el contrato.
- **[Trade-off]** Habrá más archivos y layouts que con una pantalla condicionada por rol. **Mitigación:** centralizar la resolución de perfil y reutilizar primitivas visuales sin compartir fronteras de autorización.

## Migration Plan

1. Añadir las nuevas rutas y layouts sin eliminar inicialmente las páginas existentes.
2. Convertir `/` en un router por rol y convertir las rutas legacy en redirecciones.
3. Mover la gestión de niños y perfiles bajo `/staff` y el feed familiar bajo `/family`.
4. Verificar rutas con sesiones `staff`, `parent`, `admin` y sin sesión, incluyendo URLs directas y recargas.
5. Confirmar que las APIs y RLS continúan rechazando operaciones no autorizadas.
6. Si el cambio debe revertirse, restaurar temporalmente los entrypoints anteriores y retirar las redirecciones nuevas; no requiere rollback de base de datos.

## Open Questions

No quedan preguntas de producto que bloqueen la implementación. El contenido administrativo real queda deliberadamente reservado para un cambio futuro.
