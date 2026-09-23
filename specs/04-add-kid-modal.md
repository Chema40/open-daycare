# SPEC 04 — Modal para agregar niño

> **Status:** Implementado
> **Depends on:** SPEC 02
> **Date:** 2026-09-23
> **Objective:** Implementar en `/kids` el modal visual y validable de «Agregar niño» a partir de `references/pantallas/agregar-nino.dc.html`, sin crear ni persistir nuevos registros.

## Scope

**In:**

- Abrir el modal al pulsar el botón «Agregar niño» de `app/kids/page.tsx`.
- Reproducir la composición visual de `references/pantallas/agregar-nino.dc.html` dentro de la identidad visual de SPEC 02.
- Mostrar los campos «Nombre completo», «Fecha de nacimiento», «Sala», «Alergias (etiquetas)» y «Notas médicas».
- Hacer obligatorios «Nombre completo», «Fecha de nacimiento» y «Sala».
- Ofrecer las salas «Soles», «Planetas» y «Cometas», con «Soles» seleccionado inicialmente.
- Aplicar una máscara `DD/MM/AAAA` a la fecha de nacimiento.
- Validar que la fecha tenga formato correcto, sea real y no sea futura.
- Mostrar errores inline accesibles y mantener el modal abierto cuando la validación falle.
- Cerrar el modal únicamente mediante «Cancelar» o después de un guardado válido.
- Reiniciar todos los campos al abrir el modal.
- Implementar foco inicial, ciclo de foco dentro del modal y devolución del foco al botón «Agregar niño» al cerrarlo.
- Mantener el listado de SPEC 02 sin cambios después de guardar.
- Adaptar el modal a viewport desktop y móvil sin scroll horizontal.
- Mantener semántica HTML, nombres accesibles, foco visible y contraste razonable.
- Actualizar `app/globals.css` con los estilos del modal, formulario, errores y responsive necesarios.

**Out of scope (for future specs):**

- Añadir el nuevo niño al listado de `/kids`.
- Crear, editar o eliminar registros en `app/kids/data.ts`.
- Persistir datos en `localStorage`, IndexedDB, archivos, API o base de datos.
- Generar IDs, slugs, avatares, edades calculadas o perfiles para el formulario.
- Gestionar padres vinculados, alergias como etiquetas estructuradas o notas médicas fuera del estado temporal del formulario.
- Implementar edición de niños existentes.
- Cerrar el modal mediante Escape o pulsando el overlay.
- Implementar estados de carga, envío asíncrono, errores de servidor o confirmaciones.
- Implementar las acciones funcionales de «Nueva publicación», «Avisos», «Mi cuenta» o «Cerrar sesión».

## Data model

Esta feature no introduce nuevas estructuras de datos persistentes. El formulario usará estado local temporal en `app/kids/page.tsx` para representar sus valores, la sala seleccionada y los errores de validación; ese estado se descarta al cerrar o guardar correctamente.

Los valores temporales tendrán esta forma conceptual:

```ts
type AddKidForm = {
  fullName: string;
  birthDate: string;
  room: "Soles" | "Planetas" | "Cometas";
  allergies: string;
  medicalNotes: string;
};
```

No se modificará el tipo `Kid` ni la colección `kids` de `app/kids/data.ts`.

## Implementation plan

1. Convertir la interacción de `app/kids/page.tsx` en un flujo de cliente capaz de controlar la apertura, el cierre y el reinicio del formulario, manteniendo el listado existente funcional.
2. Reemplazar el enlace inerte «Agregar niño» por un botón accesible que abra el modal y conserve una referencia para devolverle el foco al cerrarlo.
3. Implementar el diálogo con los cinco campos de la referencia, el selector de salas, «Cancelar» y «Guardar», incluyendo etiquetas asociadas, `required`, descripciones y mensajes de error.
4. Implementar la máscara `DD/MM/AAAA` y la validación de nombre, sala y fecha real no futura; el envío válido solo cerrará el modal y no modificará `kids`.
5. Añadir en `app/globals.css` la superficie, overlay, campos, selector, botones, estados de error, estados de foco y reglas responsive del modal.
6. Implementar el ciclo de foco del diálogo y comprobar navegación completa con teclado, incluido el retorno del foco al botón de apertura.
7. Ejecutar la aplicación y revisar `/kids` en desktop y móvil, comprobando apertura, cancelación, validación, máscara, cierre válido y ausencia de scroll horizontal.

## Acceptance criteria

- [X] `/kids` carga sin errores de renderizado.
- [X] Pulsar «Agregar niño» abre el modal sin navegar a otra ruta.
- [X] El modal reproduce los textos y campos principales de `agregar-nino.dc.html`.
- [X] «Nombre completo», «Fecha de nacimiento» y «Sala» están marcados como obligatorios.
- [X] «Alergias (etiquetas)» y «Notas médicas» aparecen como campos opcionales editables.
- [X] El selector de sala ofrece exactamente «Soles», «Planetas» y «Cometas».
- [X] «Soles» aparece seleccionado al abrir el modal.
- [X] La fecha inserta automáticamente separadores `/` siguiendo el formato `DD/MM/AAAA`.
- [X] Una fecha con día o mes imposible muestra un error inline y no cierra el modal.
- [X] Una fecha futura muestra un error inline y no cierra el modal.
- [X] Guardar con un campo obligatorio vacío muestra el error junto al campo correspondiente y mantiene el modal abierto.
- [X] Guardar con todos los datos válidos cierra el modal.
- [X] Guardar no añade ningún registro a la lista ni cambia el contador de niños.
- [X] Cancelar cierra el modal sin conservar los valores introducidos.
- [X] Cada nueva apertura muestra los campos reiniciados y «Soles» como sala inicial.
- [X] Escape y el click sobre el overlay no cierran el modal.
- [X] El foco entra en el modal al abrirlo, no escapa de él mediante Tab y vuelve al botón «Agregar niño» al cerrarlo.
- [X] Los errores de validación se anuncian mediante relaciones semánticas accesibles y los controles conservan foco visible.
- [X] `/kids` y el modal se pueden usar en viewport desktop sin scroll horizontal.
- [X] `/kids` y el modal se pueden usar en viewport móvil sin scroll horizontal.
- [X] `npx tsc --noEmit` termina correctamente.
- [X] `npm run build` termina correctamente.
- [X] `npm run lint` no introduce errores nuevos en los archivos de aplicación modificados por esta spec.
- [X] La comparación manual en navegador confirma la réplica visual del modal en desktop y móvil.

## Verification notes

- Inspección: `app/kids/page.tsx`, `app/kids/data.ts`, `app/globals.css`, `app/layout.tsx` y `references/pantallas/agregar-nino.dc.html`.
- Comandos: `npx tsc --noEmit` y `npm run build` terminaron correctamente. `npm run lint` mantiene únicamente los dos errores legacy documentados en `references/pantallas/support.js`; no introdujo errores en los archivos de aplicación de esta spec.
- Playwright: `/kids` se revisó en desktop (1200 px) y móvil (390 px). Se verificaron apertura, ruta, campos, opciones, valores obligatorios, máscara, fechas inválidas/futuras, errores inline, guardado válido, reinicio, cancelación, contador, foco inicial, ciclo de Tab, retorno del foco y ausencia de scroll horizontal.
- Evidencia visual: `.playwright-mcp/kids-desktop-modal.png`, `.playwright-mcp/kids-mobile-modal.png` y `.playwright-mcp/reference-add-kid.png`, con snapshots asociados. La referencia emitió solo un 404 de `favicon.ico`, ajeno a la pantalla comparada.
- Pendiente: el click sobre el overlay no se ejercitó de forma interactiva en Playwright; por ello el criterio combinado de Escape y overlay permanece sin marcar, aunque Escape sí fue comprobado y el código no registra un manejador de cierre para el overlay.

## Decisions

- **Sí:** implementar el formulario como modal en `/kids`. Es el comportamiento solicitado para el botón existente de SPEC 02.
- **Sí:** limitar «Guardar» a validar y cerrar. No existe todavía un contrato de persistencia ni se debe alterar la lista estática.
- **Sí:** conservar los cinco campos de la referencia. Solo los tres campos indicados son obligatorios.
- **Sí:** usar «Soles», «Planetas» y «Cometas» como opciones fijas. Permite probar el selector sin introducir gestión de salas.
- **Sí:** usar `DD/MM/AAAA` con máscara, fecha real y restricción de fecha futura. Es el formato visible en la referencia y evita valores ambiguos.
- **Sí:** mostrar errores inline. Permite identificar el campo inválido sin abandonar el contexto del modal.
- **Sí:** reiniciar el formulario en cada apertura. El modal no representa un borrador persistente.
- **Sí:** exigir ciclo de foco completo. El modal debe ser usable con teclado y devolver el foco a su origen.
- **No:** cerrar con Escape o overlay. La decisión mantiene el cierre limitado a la acción explícita «Cancelar» o al guardado válido.
- **No:** añadir datos a `kids` ni persistirlos. El alta real requiere una spec de datos y almacenamiento independiente.

## Risks

| Risk | Mitigation |
| --- | --- |
| Convertir la página a cliente puede alterar el renderizado existente de `/kids` | Mantener el modelo, el marcado del listado y la navegación de SPEC 02 sin cambios funcionales, y verificar build y comparación visual. |
| La máscara puede permitir fechas parcialmente escritas o inválidas | Validar el valor completo antes de cerrar y asociar el mensaje al campo mediante `aria-describedby` y `aria-invalid`. |
| El foco puede escapar o perderse al cerrar el diálogo | Guardar el botón origen, enfocar el primer control al abrir y restaurar el foco al cerrar. |
| El formulario puede desbordarse en móvil | Limitar la superficie del diálogo, permitir scroll vertical interno y comprobar explícitamente la ausencia de scroll horizontal. |
| El lint global puede incluir errores legacy de `references/pantallas/` | Separar los errores preexistentes de la validación de los archivos de aplicación modificados por esta spec. |

## What is **not** in this spec

- Alta real de niños en el listado.
- Persistencia local o remota.
- Creación de IDs, slugs, edades, avatares o perfiles.
- Edición o eliminación de niños existentes.
- Gestión de padres, salas o etiquetas como entidades.
- Cierre mediante Escape u overlay.
- Envío asíncrono, API, base de datos o errores de servidor.

Cada una de estas capacidades requiere una spec independiente.
