# SPEC 03 — Login y activación de cuenta

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-23
> **Objective:** Implementar las pantallas estáticas responsive de login y activación de cuenta a partir de las referencias proporcionadas, sin navbar ni autenticación real.

## Scope

**In:**

- Implementar la pantalla de login en `app/login/page.tsx`.
- Implementar la pantalla de activación de cuenta en `app/activate-account/page.tsx`.
- Reproducir visualmente `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html`.
- Mantener los textos, valores de ejemplo, identidad de Mateo, Sala Soles, colores, tipografías, espaciado, bordes y sombras de las referencias.
- Eliminar completamente del login el selector de tipo de usuario Personal/Familia.
- Mantener la composición responsive para viewport desktop y móvil.
- Mantener el estado visual marcado del consentimiento de fotos en la activación de cuenta.
- Mantener semántica HTML, nombres accesibles, foco de teclado visible y contraste razonable.
- Usar enlaces y acciones inertes sin navegación ni lógica de autenticación.
- Actualizar `app/globals.css` con los estilos compartidos necesarios.

**Out of scope (for future specs):**

- Autenticación real, sesiones, cierre de sesión o recuperación de contraseña.
- Validación funcional de email, contraseña o código de invitación.
- Creación, activación o persistencia de cuentas.
- Conexión con API, base de datos o proveedor de identidad.
- Navegación funcional entre login, activación y el resto de la aplicación.
- Selector de roles Personal/Familia en el login.
- Navbar o navegación principal en cualquiera de las dos pantallas.
- Checkbox funcional o persistencia del consentimiento de fotos.
- Estados de carga, error, código inválido o cuenta ya activada.

## Data model

This feature introduces no new data structures. It renders fixed presentation data directly in the two route components and does not persist or fetch information.

## Implementation plan

1. Crear `app/login/page.tsx` con la composición de dos columnas de la referencia, conservando la marca, el panel informativo, el formulario y los textos, pero sin el bloque Personal/Familia.
2. Crear `app/activate-account/page.tsx` con la tarjeta de invitación, los campos de código, email y contraseña, el consentimiento marcado y las acciones visuales de la referencia.
3. Añadir en `app/globals.css` las reglas compartidas de tipografía, paleta, campos, botones, estados de foco y adaptación responsive necesarias para ambas rutas, reutilizando la identidad de SPEC 01.
4. Mantener todos los enlaces y acciones de ambas pantallas con destinos inertes (`#`), sin crear navegación ni lógica de autenticación.
5. Ejecutar la aplicación y revisar `/login` y `/activate-account` en viewport desktop y móvil, corrigiendo únicamente diferencias visuales, problemas de accesibilidad o desbordamiento horizontal.

## Acceptance criteria

- [x] La ruta `/login` carga sin errores de renderizado.
- [x] La ruta `/activate-account` carga sin errores de renderizado.
- [x] Ninguna de las dos pantallas muestra el navbar o la navegación lateral del home.
- [x] El login reproduce el panel visual izquierdo, la marca OpenDayCare y el formulario de la referencia.
- [x] El login no muestra las opciones Personal ni Familia ni ningún selector equivalente.
- [x] El login conserva los campos de email y contraseña, el enlace de recuperación y el botón de inicio de sesión.
- [x] La activación reproduce la bienvenida, la invitación a Mateo en Sala Soles, los campos y el consentimiento de la referencia.
- [x] El consentimiento de fotos aparece visualmente marcado y no implementa lógica funcional.
- [x] Los textos, valores de ejemplo, colores, tipografías, bordes, sombras y espaciado son visualmente equivalentes a las referencias.
- [x] Todos los enlaces y acciones de ambas pantallas usan destinos inertes y no intentan autenticar, validar ni persistir datos.
- [x] Las dos pantallas se pueden usar en viewport desktop sin scroll horizontal.
- [x] Las dos pantallas se pueden usar en viewport móvil sin scroll horizontal.
- [x] Los elementos interactivos tienen nombres accesibles y foco de teclado visible.
- [x] `npx tsc --noEmit` termina correctamente.
- [x] `npm run build` termina correctamente.
- [x] `npm run lint` no introduce errores nuevos en los archivos de aplicación modificados por esta spec.
- [x] La comparación manual en navegador confirma la réplica visual de `/login` y `/activate-account` en desktop y móvil.

## Verification notes

- Verificado con `npx tsc --noEmit`, `npm run build` y `npm run lint`. TypeScript y build terminan correctamente. Lint conserva únicamente los 2 errores legacy de `references/pantallas/support.js` y sus warnings documentados; no hay errores en los archivos de aplicación de esta spec.
- Playwright revisó `http://localhost:3000/login` y `http://localhost:3000/activate-account` en 1200×734 y 1440×900, y en móvil 390×844. Se capturaron snapshots, métricas y screenshots en `.playwright-mcp/`; no hubo errores de renderizado ni scroll horizontal. La consola solo mostró avisos de `autocomplete` ausente.
- Se comprobaron nombres accesibles mediante snapshot/labels y foco visible mediante navegación con teclado. Los enlaces y formularios usan `#` y permanecen inertes.
- La comparación con `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html` confirma composición, espaciado, tipografía, paleta, bordes, sombras y responsive; el selector Personal/Familia se omite conforme a esta spec.
- Corregido el pie del hero de `/login` para incluir `🌿 Guardería Sala Soles`, igual que la referencia.

## Decisions

- **Sí:** usar las rutas `/login` y `/activate-account`. Son rutas descriptivas y no dependen de los nombres `.dc.html` de las referencias.
- **Sí:** mantener ambas pantallas estáticas. Es consistente con SPEC 01 y SPEC 02, que todavía no introducen backend ni autenticación.
- **Sí:** limitar los cambios de pantalla a `app/login/page.tsx` y `app/activate-account/page.tsx`, con ajustes compartidos en `app/globals.css`.
- **Sí:** conservar exactamente los textos, valores de ejemplo, identidad de Mateo, Sala Soles, colores, tipografías y composición de las referencias.
- **Sí:** eliminar únicamente el selector Personal/Familia del login, incluido su estado y lógica asociada.
- **Sí:** mantener todos los enlaces y acciones inertes (`#`). La navegación entre las pantallas y los flujos de usuario requieren una spec posterior.
- **Sí:** conservar el consentimiento visualmente marcado. La referencia muestra ese estado y no se necesita todavía un contrato de consentimiento funcional.
- **No:** implementar validación local. Incluso sin backend, introducir estados de validación ampliaría el alcance visual acordado.
- **No:** mostrar navbar ni navegación lateral. Ambas referencias son pantallas aisladas de acceso.
- **No:** crear datos compartidos o persistencia. El contenido es fijo y no introduce un modelo de dominio.

## Risks

| Risk | Mitigation |
| --- | --- |
| El layout de dos columnas del login puede desbordarse en móvil | Cambiar a una sola columna en viewport estrecho y comprobar explícitamente la ausencia de scroll horizontal. |
| Los estilos de acceso pueden divergir de la identidad de SPEC 01 | Reutilizar variables, tipografías y valores de `app/globals.css` cuando sea posible. |
| Los valores de ejemplo pueden confundirse con funcionalidad real | Mantener acciones inertes y documentar explícitamente la ausencia de autenticación y validación. |
| El lint global puede incluir errores preexistentes de `references/pantallas/` | Separar los errores legacy de la validación de los archivos de aplicación modificados por esta spec. |

## What is **not** in this spec

- Autenticación, sesiones o recuperación de contraseña.
- Validación funcional de formularios o códigos de invitación.
- Creación, activación o persistencia de cuentas.
- API, base de datos o proveedor de identidad.
- Navegación funcional entre las pantallas.
- Navbar o navegación lateral.
- Selector Personal/Familia.
- Consentimiento funcional o persistente.
- Estados de carga, error o cuenta activada.

Cada una de estas capacidades requiere una spec independiente.
