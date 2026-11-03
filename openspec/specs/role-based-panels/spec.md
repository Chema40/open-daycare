# Role-Based Panels Specification

## Purpose

Separa la experiencia de OpenDayCare en paneles con URLs y límites de autorización explícitos para que el personal gestione la guardería, las familias consulten únicamente su información y la futura administración tenga una frontera propia.

## Requirements

### Requirement: El sistema debe dirigir a cada rol a su panel
El sistema SHALL resolver el rol autenticado en servidor y SHALL dirigir `staff` a `/staff/feed`, `parent` a `/family/feed` y `admin` a `/admin` cuando el usuario acceda a `/` o complete el inicio de sesión.

#### Scenario: Staff entra al inicio
- **WHEN** un usuario autenticado con rol `staff` solicita `/`
- **THEN** el sistema redirige a `/staff/feed`

#### Scenario: Family entra al inicio
- **WHEN** un usuario autenticado con rol `parent` solicita `/`
- **THEN** el sistema redirige a `/family/feed`

#### Scenario: Admin entra al inicio
- **WHEN** un usuario autenticado con rol `admin` solicita `/`
- **THEN** el sistema redirige a `/admin`

### Requirement: El panel staff debe estar reservado al personal
El sistema SHALL permitir el acceso a `/staff` y sus rutas descendientes únicamente a usuarios autenticados con rol `staff`, y SHALL mantener allí las funciones de feed, gestión de niños, perfiles de niños e invitaciones.

#### Scenario: Staff accede a su panel
- **WHEN** un usuario autenticado con rol `staff` solicita `/staff` o `/staff/feed`
- **THEN** el sistema muestra o redirige al feed staff sin mostrar un error de permisos

#### Scenario: Parent intenta acceder al panel staff
- **WHEN** un usuario autenticado con rol `parent` solicita cualquier ruta bajo `/staff`
- **THEN** el sistema no renderiza contenido staff y redirige a `/family/feed`

#### Scenario: Admin intenta acceder al panel staff
- **WHEN** un usuario autenticado con rol `admin` solicita cualquier ruta bajo `/staff`
- **THEN** el sistema no renderiza contenido staff y redirige a `/admin`

### Requirement: El panel family debe estar reservado a las familias
El sistema SHALL permitir el acceso a `/family` y sus rutas descendientes únicamente a usuarios autenticados con rol `parent`, y SHALL mostrar solo el feed y los datos que las políticas de acceso permitan para sus niños vinculados.

#### Scenario: Parent accede a su panel
- **WHEN** un usuario autenticado con rol `parent` solicita `/family` o `/family/feed`
- **THEN** el sistema muestra o redirige al feed family

#### Scenario: Staff intenta acceder al panel family
- **WHEN** un usuario autenticado con rol `staff` solicita cualquier ruta bajo `/family`
- **THEN** el sistema no renderiza contenido family y redirige a `/staff/feed`

#### Scenario: Parent sin niños vinculados consulta el feed
- **WHEN** un usuario `parent` autenticado no tiene relaciones activas en `parent_children`
- **THEN** el sistema muestra un estado vacío sin datos de otros niños, salas o familias

### Requirement: El área admin debe tener una frontera independiente
El sistema SHALL permitir `/admin` únicamente al rol `admin` y SHALL mostrar una pantalla placeholder mientras no exista funcionalidad administrativa implementada.

#### Scenario: Admin accede al área reservada
- **WHEN** un usuario autenticado con rol `admin` solicita `/admin`
- **THEN** el sistema muestra el placeholder del área administrativa futura

#### Scenario: Staff o parent intenta acceder al área admin
- **WHEN** un usuario autenticado con rol `staff` o `parent` solicita `/admin`
- **THEN** el sistema no muestra el placeholder administrativo y redirige a su panel propio

### Requirement: Las rutas legacy deben conservar compatibilidad sin ampliar permisos
El sistema SHALL redirigir `/kids` a `/staff/kids` y `/kids/[identifier]` a `/staff/kids/[identifier]`, aplicando la autorización del panel staff antes de mostrar cualquier contenido.

#### Scenario: Staff usa una ruta legacy de niños
- **WHEN** un usuario `staff` autenticado solicita `/kids/child-123`
- **THEN** el sistema redirige a `/staff/kids/child-123`

#### Scenario: Parent usa una ruta legacy de niños
- **WHEN** un usuario `parent` autenticado solicita `/kids`
- **THEN** el sistema no muestra la gestión de niños y redirige a `/family/feed`

### Requirement: Las rutas protegidas deben distinguir sesión ausente y rol insuficiente
El sistema SHALL mantener `/login` y `/activate-account` como rutas públicas, SHALL redirigir a `/login` a quien no tenga sesión y SHALL decidir los permisos usando el perfil del servidor, no valores enviados por el cliente.

#### Scenario: Usuario sin sesión solicita un panel
- **WHEN** una persona sin sesión solicita `/staff/feed`, `/family/feed` o `/admin`
- **THEN** el sistema redirige a `/login` sin renderizar datos privados

#### Scenario: Usuario no autenticado abre activación
- **WHEN** una persona sin sesión solicita `/activate-account`
- **THEN** el sistema permite cargar la ruta pública

#### Scenario: Cliente manipula un rol enviado
- **WHEN** una petición incluye un rol de usuario distinto al perfil almacenado en servidor
- **THEN** el sistema ignora ese valor y aplica el rol resuelto desde la sesión y el perfil autorizado

### Requirement: Cada panel debe exponer únicamente acciones de su perfil
El sistema SHALL presentar layouts, navegación, textos y acciones coherentes con el panel actual, sin mostrar a `parent` acciones de gestión o publicación staff ni mostrar al `staff` acciones propias del panel family como si fueran su contexto principal.

#### Scenario: Family visualiza su navegación
- **WHEN** un `parent` autenticado carga `/family/feed`
- **THEN** la navegación no contiene enlaces visibles a gestión de niños, invitaciones o creación de publicaciones

#### Scenario: Staff visualiza su navegación
- **WHEN** un `staff` autenticado carga `/staff/feed`
- **THEN** la navegación contiene las entradas staff disponibles y el activador de publicación solo si el perfil está activo
