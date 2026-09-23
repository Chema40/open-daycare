# SPEC 05 — Modal para vincular padre

> **Status:** AprovadoEmpie
> **Depends on:** SPEC 02, SPEC 03
> **Date:** 2026-09-23
> **Objective:** Implementar en los perfiles de niño un modal para invitar y verificar visualmente a otro padre mediante email.

## Scope

**In:**

- Abrir el modal desde «Vincular padre» cuando el niño no tenga padres vinculados.
- Abrir el modal desde «Vincular otro padre» cuando el niño ya tenga padres vinculados.
- Aplicar el flujo a todos los perfiles de `app/kids/[identifier]/page.tsx`.
- Reproducir la composición visual de `references/pantallas/vincular-padre.dc.html` dentro de la identidad visual existente.
- Mostrar el nombre del niño en la cabecera del modal.
- Mostrar los campos obligatorios «Nombre del padre/madre», «Email» y «Parentesco».
- Ofrecer exactamente las opciones «Mamá», «Papá» y «Tutor/a».
- Mostrar un código de invitación generado para la demo y su vencimiento de 7 días.
- Validar los campos obligatorios y el formato del email con errores inline accesibles.
- Mantener el modal abierto cuando la validación falle.
- Avanzar al paso de verificación dentro del mismo modal después de enviar datos válidos.
- Mostrar un campo para introducir el código de verificación enviado por email.
- Aceptar el código fijo `123456` como código válido de demo.
- Mostrar un error inline cuando el código de verificación sea incorrecto.
- Ofrecer una acción visual «Reenviar código» sin envío real ni temporizador.
- Mostrar una confirmación temporal y cerrar el modal cuando el código sea correcto.
- Mantener la invitación y la verificación únicamente en estado temporal de cliente.
- Implementar foco inicial, ciclo de foco dentro del modal y devolución del foco al activador al cerrarlo.
- Permitir cerrar el modal mediante «Cancelar» o el control de cierre explícito.
- No cerrar el modal mediante Escape ni pulsando el overlay.
- Adaptar el modal a viewport desktop y móvil sin scroll horizontal.
- Mantener semántica HTML, nombres accesibles, foco visible y contraste razonable.
- Crear el componente en `app/kids/[identifier]/link-parent-modal.tsx`.
- Actualizar `app/kids/[identifier]/page.tsx` para abrir y controlar el modal.
- Actualizar `app/globals.css` con los estilos del modal, formulario, estados y responsive necesarios.

**Out of scope (for future specs):**

- Envío real de correos electrónicos.
- Integración con API, base de datos o proveedor de correo.
- Autenticación, activación real de cuentas o sesiones.
- Persistencia de invitaciones, padres vinculados o códigos de verificación.
- Modificación de `app/kids/data.ts` o del tipo `LinkedParent`.
- Añadir el padre temporal al perfil o al listado después de verificarlo.
- Detección de emails duplicados, porque el modelo actual no contiene emails de los padres.
- Generación criptográficamente segura o persistente de códigos.
- Expiración funcional del código de invitación.
- Gestión de reenvíos reales, límites de reintentos o temporizadores.
- Edición o eliminación de padres vinculados.
- Estados de error de servidor, red, rate limit o proveedor de correo.

## Data model

Esta feature no introduce nuevas estructuras de datos persistentes ni modifica `LinkedParent`.

El modal usará estado local temporal con una forma conceptual equivalente a:

```ts
type LinkParentForm = {
  name: string;
  email: string;
  relationship: "Mamá" | "Papá" | "Tutor/a";
};

type LinkParentStep = "form" | "verification";
```

El código de invitación se mostrará como un valor fijo de demo equivalente a `7K4P9`. El código de verificación válido será `123456`. Ambos valores se descartan al cerrar o completar el modal.

## Implementation plan

1. Crear `app/kids/[identifier]/link-parent-modal.tsx` como componente cliente con la estructura de diálogo, formulario inicial, estado local y propiedades para el nombre del niño, apertura y cierre.
2. Implementar en el componente los campos obligatorios, las tres opciones de parentesco, el código de invitación de demo y la validación inline de nombre, email y parentesco.
3. Añadir al componente el paso de verificación con código `123456`, mensaje de email enviado, acción visual «Reenviar código», error inline y confirmación temporal.
4. Integrar el componente en `app/kids/[identifier]/page.tsx`, convertir el activador en botón accesible y mostrar «Vincular padre» o «Vincular otro padre» según `linkedParents.length`.
5. Implementar la gestión de foco del diálogo: foco inicial, ciclo de Tab, retorno al botón activador y cierre únicamente mediante las acciones explícitas acordadas.
6. Añadir en `app/globals.css` los estilos del overlay, superficie, cabecera, campos, parentesco, código, verificación, errores, foco, confirmación y responsive del modal.
7. Ejecutar la aplicación y revisar los perfiles con y sin padres en desktop y móvil, comprobando apertura, validación, verificación, reenvío visual, cierre, foco y ausencia de scroll horizontal.

## Acceptance criteria

- [ ] `/kids/1` carga sin errores de renderizado.
- [ ] Un perfil con padres muestra el activador «Vincular otro padre».
- [ ] Un perfil sin padres muestra el activador «Vincular padre».
- [ ] Pulsar cualquiera de los dos activadores abre el modal sin navegar a otra ruta.
- [ ] El modal muestra el nombre del niño correspondiente al perfil abierto.
- [ ] El modal reproduce la composición visual principal de `vincular-padre.dc.html`.
- [ ] El modal muestra los campos «Nombre del padre/madre», «Email» y «Parentesco».
- [ ] Los tres campos están marcados como obligatorios.
- [ ] El selector de parentesco ofrece exactamente «Mamá», «Papá» y «Tutor/a».
- [ ] El código de invitación `7K4P9` aparece junto al vencimiento de 7 días.
- [ ] Enviar el formulario con un campo obligatorio vacío muestra un error inline y mantiene el modal abierto.
- [ ] Enviar un email con formato inválido muestra un error inline y mantiene el modal abierto.
- [ ] Enviar datos válidos muestra el paso de verificación dentro del mismo modal.
- [ ] El paso de verificación muestra un campo para el código y un mensaje de envío al email introducido.
- [ ] Introducir un código distinto de `123456` muestra un error inline y no cierra el modal.
- [ ] Introducir `123456` muestra una confirmación temporal y cierra el modal.
- [ ] «Reenviar código» produce únicamente un estado visual temporal y no realiza una petición de red.
- [ ] Cancelar o usar el control de cierre cierra el modal sin modificar el perfil.
- [ ] Escape y el click sobre el overlay no cierran el modal.
- [ ] Cada nueva apertura reinicia los campos, el paso y los errores.
- [ ] El foco entra en el modal al abrirlo, no escapa mediante Tab y vuelve al activador al cerrarlo.
- [ ] Los errores se relacionan semánticamente con sus controles y los elementos interactivos conservan foco visible.
- [ ] La invitación no modifica `app/kids/data.ts`, el perfil ni la lista después de completar la verificación.
- [ ] El perfil y el modal se pueden usar en viewport desktop sin scroll horizontal.
- [ ] El perfil y el modal se pueden usar en viewport móvil sin scroll horizontal.
- [ ] `npx tsc --noEmit` termina correctamente.
- [ ] `npm run build` termina correctamente.
- [ ] `npm run lint` no introduce errores nuevos en los archivos de aplicación modificados por esta spec.
- [ ] La comparación manual en navegador confirma la réplica visual del modal en desktop y móvil.

## Decisions

- **Sí:** implementar el flujo como modal en los perfiles. Es la interacción solicitada para «Vincular padre» y «Vincular otro padre».
- **Sí:** abrir el mismo modal desde ambos textos. Evita duplicar el flujo y permite cubrir perfiles con y sin padres.
- **Sí:** usar `app/kids/[identifier]/link-parent-modal.tsx`. Mantiene el componente junto a la ruta que lo utiliza.
- **Sí:** mantener los nombres, email y parentesco como campos obligatorios. Son los datos mínimos de la invitación mostrada en la referencia.
- **Sí:** usar exactamente «Mamá», «Papá» y «Tutor/a». Son las opciones visibles en la referencia.
- **Sí:** generar y mostrar el código de invitación de demo `7K4P9`. El usuario no debe introducirlo.
- **Sí:** añadir un paso de verificación en el mismo modal. Representa la capa de verificación de email sin necesitar un servicio externo.
- **Sí:** aceptar `123456` como código fijo de demo. Permite verificar el flujo de forma determinista.
- **Sí:** ofrecer «Reenviar código» como acción visual temporal. Permite representar el estado sin inventar un envío real.
- **Sí:** mostrar errores inline y exigir cierre explícito. Facilita identificar el problema y evita perder datos accidentalmente.
- **Sí:** mantener foco inicial, ciclo de foco y devolución del foco. El diálogo debe ser usable con teclado.
- **Sí:** mantener todos los cambios en estado local temporal. No existe todavía un contrato de persistencia.
- **No:** detectar emails duplicados. `LinkedParent` no contiene emails y añadirlos ampliaría esta spec.
- **No:** modificar `app/kids/data.ts`. La invitación verificada no se persiste ni altera los datos estáticos.
- **No:** enviar correos o llamar a una API. La verificación real requiere una spec de backend e integración.
- **No:** cerrar mediante Escape u overlay. El cierre queda limitado a acciones explícitas.

## Risks

| Risk | Mitigation |
| --- | --- |
| Convertir el perfil en cliente puede alterar su renderizado estático | Mantener la resolución del perfil y los datos en el servidor, aislando la interacción en el componente cliente del modal. |
| El foco puede escapar o perderse al cambiar al paso de verificación | Compartir el mismo diálogo, actualizar el foco al primer control visible de cada paso y restaurarlo al activador al cerrar. |
| La validación visual puede confundirse con verificación real | Mostrar explícitamente que el código es de demo en la implementación y mantener fuera de alcance el correo real y la persistencia. |
| El modal puede desbordarse en móvil | Limitar la superficie, permitir desplazamiento vertical interno y comprobar explícitamente la ausencia de scroll horizontal. |
| El código fijo puede reutilizarse fuera de una demo | Mantenerlo encapsulado en el componente y documentar que no es un mecanismo de seguridad. |
| El lint global puede incluir errores legacy de `references/pantallas/` | Separar los errores preexistentes de la validación de los archivos de aplicación modificados. |

## What is **not** in this spec

- Envío real de email o integración con proveedores.
- API, base de datos, autenticación o activación real de cuentas.
- Persistencia de invitaciones, códigos o padres vinculados.
- Modificación del perfil o del listado tras completar la verificación.
- Detección de emails duplicados.
- Modificación del modelo `LinkedParent`.
- Expiración, reintentos o límites funcionales del código.
- Estados de red, servidor o proveedor de correo.
- Edición o eliminación de padres vinculados.

Cada una de estas capacidades requiere una spec independiente.
