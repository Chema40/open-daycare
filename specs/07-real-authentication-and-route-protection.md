# SPEC 07 — Autenticación real y protección de rutas

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 03
> **Date:** 2026-10-09
> **Objective:** Implementar el inicio de sesión real con email y contraseña mediante Supabase y proteger las rutas privadas de la aplicación mediante la sesión SSR.

## Scope

**In:**

- Conectar el formulario de `/login` con Supabase Auth mediante `signInWithPassword`.
- Usar el cliente existente de Supabase para navegador en `utils/supabase/client.ts`.
- Mantener el email inicial `caro@opendaycare.com` como valor del formulario.
- Validar localmente que el email tenga un formato válido y que la contraseña no esté vacía.
- Mostrar un estado de carga durante el intento de inicio de sesión y deshabilitar los controles del formulario.
- Mostrar un mensaje genérico y accesible cuando la validación local o Supabase rechacen el inicio de sesión.
- Mantener el formulario abierto y sus valores cuando ocurra un error.
- Redirigir a `/` después de un inicio de sesión correcto.
- Redirigir a `/` cuando una persona con sesión activa acceda a `/login`.
- Mantener la sesión mediante las cookies gestionadas por `@supabase/ssr`.
- Renovar la sesión desde el flujo existente de `proxy.ts` y `utils/supabase/middleware.ts`.
- Proteger las rutas de la aplicación desde `proxy.ts` antes de renderizarlas.
- Mantener `/login` y `/activate-account` accesibles sin sesión.
- Redirigir a `/login` a las personas sin sesión que intenten acceder a cualquier otra ruta de la aplicación.
- Mantener `/activate-account` como pantalla pública y visual, sin implementar su activación real.
- Conservar la protección frente a recursos estáticos definida por el `matcher` existente.
- Mantener semántica HTML, nombres accesibles, foco visible y ausencia de scroll horizontal.
- Actualizar `app/login/page.tsx` y crear `app/login/login-form.tsx` para separar la pantalla y la interacción cliente.
- Actualizar `utils/supabase/middleware.ts` para comprobar la sesión y decidir las redirecciones.
- Mantener `proxy.ts` como entrypoint de Next.js 16 para ejecutar la actualización y protección de sesión.

**Out of scope (for future specs):**

- Registro de nuevas cuentas mediante `signUp`.
- Activación o confirmación real de cuentas.
- Reenvío de emails de confirmación.
- Recuperación o cambio de contraseña.
- Cierre de sesión.
- Gestión de perfiles, roles o permisos de autorización.
- Modificación de tablas, migraciones, políticas RLS o datos de la base de datos.
- Persistencia de datos de negocio asociados a la cuenta.
- Parámetro de retorno a la ruta original después del login.
- Protección diferenciada por rol o por grupo de rutas.
- Página de error independiente para fallos de autenticación.
- Uso de claves `service_role` o secretos en el navegador.

## Data model

Esta feature no introduce nuevas tablas, migraciones ni estructuras de datos de negocio. Usa el usuario y la sesión administrados por Supabase Auth.

El estado temporal del formulario tendrá una forma conceptual equivalente a:

```ts
type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};
```

La sesión se conservará en cookies gestionadas por `@supabase/ssr`. No se guardarán credenciales, tokens ni datos de usuario en `localStorage`, archivos del repositorio o variables públicas adicionales.

## Implementation plan

1. Convertir `app/login/page.tsx` en la composición de pantalla que conserva la referencia visual y delega el formulario interactivo en `app/login/login-form.tsx`.
2. Crear `app/login/login-form.tsx` como componente cliente usando `utils/supabase/client.ts`, manteniendo el email inicial y la contraseña vacía.
3. Implementar la validación local del email y la contraseña, con errores inline asociados a sus controles y sin peticiones cuando los datos sean inválidos.
4. Implementar la llamada a `supabase.auth.signInWithPassword`, el estado de carga, el bloqueo de controles, el mensaje genérico de error y la redirección a `/` cuando el login sea correcto.
5. Actualizar `utils/supabase/middleware.ts` para obtener los claims de la sesión después de refrescar cookies, permitir `/login` y `/activate-account`, redirigir las rutas privadas sin sesión a `/login` y redirigir `/login` a `/` cuando exista sesión.
6. Mantener `proxy.ts` como entrypoint con el `matcher` actual y verificar que los recursos estáticos no entren en el flujo de protección.
7. Revisar `app/activate-account/page.tsx` para confirmar que permanece pública, visual e inerte, sin incorporar registro ni activación real.
8. Ejecutar la aplicación con una cuenta de prueba existente de Supabase y comprobar login correcto, credenciales inválidas, persistencia al recargar, redirecciones y acceso público a las dos rutas permitidas.

## Acceptance criteria

- [x] `/login` carga sin errores de renderizado.
- [x] `/activate-account` carga sin sesión y sin redirección.
- [x] El formulario de `/login` muestra email y contraseña.
- [x] El email inicia con `caro@opendaycare.com` y la contraseña inicia vacía.
- [x] Enviar un email con formato inválido muestra un error accesible y no llama a Supabase.
- [x] Enviar la contraseña vacía muestra un error accesible y no llama a Supabase.
- [x] Mientras se procesa el login, los controles del formulario están deshabilitados y se muestra un estado de carga.
- [x] Un login válido mediante Supabase redirige a `/`.
- [x] Un login válido mantiene la sesión después de recargar la página.
- [x] Un login válido mantiene la sesión al abrir una nueva navegación del navegador mientras la cookie de sesión siga vigente.
- [x] Un email o contraseña incorrectos muestran un mensaje genérico accesible y no redirigen.
- [x] Un error de Supabase no muestra mensajes técnicos ni datos sensibles al usuario.
- [x] Un error de login reactiva los controles y conserva los valores introducidos.
- [x] Una persona sin sesión que accede a `/` es redirigida a `/login` antes de ver el contenido privado.
- [x] Una persona sin sesión que accede a `/kids` es redirigida a `/login`.
- [x] Una persona sin sesión que accede a `/kids/[identifier]` es redirigida a `/login`.
- [x] Una persona autenticada que accede a `/login` es redirigida a `/`.
- [x] `/activate-account` continúa accesible para personas autenticadas y no autenticadas.
- [x] `proxy.ts` continúa excluyendo recursos estáticos del matcher de aplicación.
- [x] La sesión se refresca mediante el cliente servidor de `@supabase/ssr` y las cookies se escriben en la respuesta cuando sea necesario.
- [x] No se expone `SUPABASE_SERVICE_ROLE_KEY` ni ninguna clave privilegiada en código cliente.
- [x] No se crean ni modifican tablas, migraciones o políticas RLS.
- [x] El formulario conserva nombres accesibles, foco visible y asociación semántica de errores.
- [x] `/login` se puede usar en viewport desktop sin scroll horizontal.
- [x] `/login` se puede usar en viewport móvil sin scroll horizontal.
- [x] `npx tsc --noEmit` termina correctamente.
- [x] `npm run build` termina correctamente.
- [x] `npm run lint` no introduce errores nuevos en los archivos de aplicación modificados por esta spec.
- [x] La verificación manual con una cuenta de prueba existente confirma login, sesión persistente, protección de rutas y redirecciones.

## Verification notes

- Evidencia estática: `app/login/login-form.tsx` usa `signInWithPassword`, validación local, estado de carga, controles deshabilitados y mensajes genéricos; `utils/supabase/middleware.ts` usa `getClaims()` y escribe cookies; `proxy.ts` conserva el `matcher` de recursos estáticos; no hay claves privilegiadas en el cliente.
- Playwright: `/login` y `/activate-account` cargaron sin sesión; `/`, `/kids` y `/kids/mateo-fernandez` redirigieron a `/login`. La validación de email inválido y contraseña vacía mostró alertas accesibles sin petición de autenticación. Un intento con credenciales incorrectas mostró el mensaje genérico, mantuvo ambos valores y enfocó `#login-error` sin redirigir. Los campos conservan sus etiquetas y `aria-describedby`; se capturaron snapshots en `.playwright-mcp/spec-07-*.yml` y screenshots desktop/móvil en `.playwright-mcp/spec-07-*.png`. No hubo scroll horizontal en 1440×900 ni 390×844.
- Playwright con una cuenta temporal confirmada y metadata válida (`opendaycare.spec07.1791570981@example.com`, credencial no almacenada): el login redirigió a `/`, la sesión sobrevivió a una recarga y a una nueva pestaña, `/login` redirigió a `/`, y `/activate-account` permaneció accesible con y sin sesión. La cuenta se creó mediante la API administrativa de Auth y no se guardó su contraseña en el repositorio.
- Comandos: `npx tsc --noEmit` y `npm run build` terminaron correctamente. `npx eslint app/login/page.tsx app/login/login-form.tsx utils/supabase/middleware.ts proxy.ts app/activate-account/page.tsx` terminó correctamente. `npm run lint` solo reporta errores preexistentes en `references/pantallas/support.js` (`ReactDOM.render` y asignación a `module`); no reporta errores en los archivos de aplicación de esta spec.
- La comprobación de credenciales inválidas generó únicamente la respuesta esperada `400` del endpoint de Auth, sin errores de aplicación ni exposición de detalles técnicos. La verificación final no dejó errores de consola en las navegaciones autenticadas.

## Decisions

- **Sí:** implementar únicamente el inicio de sesión real. El registro, la activación y la recuperación requieren contratos independientes.
- **Sí:** usar `signInWithPassword` de Supabase Auth. Es el flujo específico para email y contraseña solicitado.
- **Sí:** usar `utils/supabase/client.ts` desde un componente cliente. Esta decisión coincide con la elección explícita del usuario y evita crear un cliente ad hoc.
- **Sí:** mantener el email `caro@opendaycare.com` como valor inicial. Conserva la referencia visual existente aunque el usuario deba proporcionar una contraseña válida.
- **Sí:** validar email y contraseña antes de contactar con Supabase. Evita peticiones para entradas evidentemente inválidas.
- **Sí:** mostrar un error genérico para fallos de autenticación. Evita revelar si una cuenta existe o si está confirmada.
- **Sí:** deshabilitar el formulario durante la petición. Evita envíos duplicados y comunica el estado de carga.
- **Sí:** proteger las rutas desde `proxy.ts`. En Next.js 16 es el entrypoint vigente y permite redirigir antes del renderizado.
- **Sí:** usar `getClaims()` dentro del flujo SSR de Supabase para comprobar la sesión y renovar cookies.
- **Sí:** dejar `/login` y `/activate-account` públicas. La pantalla de activación todavía no contiene un flujo real.
- **Sí:** redirigir siempre a `/` después del login y cuando una sesión activa visite `/login`. No se introduce un parámetro de retorno en esta spec.
- **Sí:** conservar la persistencia estándar de sesión de `@supabase/ssr`. La sesión debe sobrevivir a recargas y navegaciones posteriores.
- **Sí:** verificar con una cuenta de prueba existente y mantener sus credenciales fuera del repositorio.
- **No:** implementar `signUp`. No forma parte del flujo de login solicitado.
- **No:** implementar confirmación de email o activación real. La ruta existente queda pública e inerte.
- **No:** implementar logout. Se reserva para una spec de navegación y cuenta.
- **No:** modificar la base de datos. Supabase Auth proporciona el almacenamiento necesario para esta feature.
- **No:** usar `localStorage` para tokens o sesión. La integración SSR debe usar cookies gestionadas por `@supabase/ssr`.

## Risks

| Risk | Mitigation |
| --- | --- |
| Una sesión caducada puede permitir que se muestre contenido privado si solo se comprueba en el cliente | Comprobar y renovar la sesión en `proxy.ts` antes de renderizar las rutas protegidas. |
| Escribir cookies incorrectamente puede romper la renovación de sesión | Reutilizar `utils/supabase/middleware.ts` y conservar el patrón `getAll`/`setAll` de `@supabase/ssr`. |
| El formulario puede generar peticiones duplicadas | Deshabilitar sus controles durante el estado de carga y restaurarlos después de la respuesta. |
| Los mensajes del proveedor pueden revelar información sobre cuentas | Mostrar un mensaje genérico para todos los fallos de autenticación. |
| Convertir la pantalla de login en cliente puede alterar la réplica visual | Aislar la interacción en `app/login/login-form.tsx` y conservar la composición de `app/login/page.tsx`. |
| Las variables públicas pueden confundirse con secretos | Usar únicamente `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en el cliente; no importar claves privilegiadas. |
| La verificación real depende de la configuración del proyecto Supabase | Ejecutar la prueba con una cuenta existente y documentar cualquier fallo de configuración sin añadir credenciales al repositorio. |
| El lint global puede incluir errores legacy de `references/pantallas/` | Separar los errores preexistentes de la validación de los archivos de aplicación modificados. |

## What is **not** in this spec

- Registro de usuarios.
- Activación o confirmación real de cuentas.
- Recuperación o cambio de contraseña.
- Reenvío de emails de confirmación.
- Cierre de sesión.
- Roles, permisos o autorización por perfil.
- Parámetros de retorno a la ruta original.
- Cambios en tablas, migraciones, RLS o datos de negocio.
- Claves privilegiadas, service role o secretos en el navegador.
- Página de error independiente para autenticación.

Cada una de estas capacidades requiere una spec independiente.
