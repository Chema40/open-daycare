# SPEC 06 — Modal para nueva publicación

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-23
> **Objective:** Implementar en el feed de `/` un modal para crear una nueva publicación a partir de `references/pantallas/crear-publicacion.dc.html`, con validación local y sin persistir ni añadir publicaciones al feed.

## Scope

**In:**

- Abrir el modal al pulsar «Nueva publicación» en la sidebar del feed.
- Abrir el mismo modal al pulsar el compositor «Compartí un momento…» del feed.
- Crear el componente cliente `app/create-post-modal.tsx`.
- Integrar el componente y sus activadores en `app/page.tsx`.
- Reproducir la composición visual de `references/pantallas/crear-publicacion.dc.html` dentro de la identidad visual de SPEC 01.
- Mostrar las secciones «Para», «Tipo», «Descripción» y «Fotos».
- Permitir seleccionar exactamente un destinatario entre «Mateo», «Sofía», «Benjamín» y «Toda la sala».
- Permitir seleccionar exactamente una categoría entre «Comida», «Siesta», «Actividad», «Logro», «Ánimo», «Foto» y «Anuncio».
- Mantener destinatario, tipo y descripción vacíos al abrir una nueva publicación.
- Hacer obligatorios el destinatario, el tipo y la descripción.
- Validar que la descripción no esté vacía después de eliminar espacios iniciales y finales.
- Mostrar errores inline accesibles y mantener el modal abierto cuando la validación falle.
- Cerrar el modal mediante «Cancelar» o después de una publicación válida.
- Reiniciar todos los campos y errores en cada nueva apertura.
- Mantener el formulario en estado local temporal.
- Mantener «Agregar» como control accesible sin selección ni subida real de archivos.
- No cambiar las publicaciones estáticas del feed después de publicar válidamente.
- Implementar foco inicial, ciclo de foco dentro del modal y devolución del foco al activador al cerrarlo.
- No cerrar el modal mediante Escape ni pulsando el overlay.
- Adaptar el modal a viewport desktop y móvil sin scroll horizontal.
- Mantener semántica HTML, nombres accesibles, foco visible y contraste razonable.
- Actualizar `app/globals.css` con los estilos del modal, controles, errores y responsive necesarios.

**Out of scope (for future specs):**

- Añadir la publicación creada al feed, aunque sea durante la sesión.
- Persistir publicaciones en `localStorage`, IndexedDB, archivos, API o base de datos.
- Enviar publicaciones a un servidor o implementar estados de carga y errores de red.
- Editar o eliminar publicaciones existentes.
- Crear IDs, fechas, autores, destinatarios o categorías dinámicas para publicaciones.
- Usar todos los niños de `app/kids/data.ts` como destinatarios; esta spec se limita a las cuatro opciones visibles indicadas.
- Seleccionar, previsualizar, comprimir, subir o persistir fotografías.
- Implementar likes, comentarios, notificaciones o permisos por rol.
- Cerrar mediante Escape o mediante el overlay.

## Data model

Esta feature no introduce nuevas estructuras de datos persistentes. El componente usará estado local temporal para representar la apertura, los valores del formulario y los errores; ese estado se descarta al cerrar o completar el modal.

Los valores temporales tendrán esta forma conceptual:

```ts
type PostRecipient = "Mateo" | "Sofía" | "Benjamín" | "Toda la sala";

type PostType =
  | "Comida"
  | "Siesta"
  | "Actividad"
  | "Logro"
  | "Ánimo"
  | "Foto"
  | "Anuncio";

type CreatePostForm = {
  recipient: PostRecipient | "";
  type: PostType | "";
  description: string;
};

type CreatePostErrors = Partial<Record<"recipient" | "type" | "description", string>>;
```

No se modificará el contenido estático de las publicaciones de `app/page.tsx` ni se creará una colección persistente.

## Implementation plan

1. Crear `app/create-post-modal.tsx` como componente cliente con propiedades para controlar su apertura, cierre y activador de origen, manteniendo el feed existente ejecutable.
2. Implementar dentro del componente el diálogo, las acciones «Cancelar» y «Publicar», las cuatro opciones de destinatario y las siete opciones de tipo, con estado local reiniciable.
3. Añadir el campo de descripción y la acción visual «Agregar» para fotos, manteniendo esta última sin selector de archivos ni cambios de estado.
4. Implementar la validación de destinatario, tipo y descripción recortada, mostrando errores inline asociados semánticamente y evitando el cierre cuando existan errores.
5. Integrar el componente en `app/page.tsx`, convirtiendo «Nueva publicación» y el compositor en botones accesibles que abran el mismo modal sin navegación.
6. Implementar el comportamiento de cierre explícito, el reinicio al abrir, el ciclo de foco, el foco inicial, la devolución del foco al activador y el bloqueo de cierre por Escape u overlay.
7. Añadir en `app/globals.css` los estilos de overlay, superficie, cabecera, chips, controles de tipo, textarea, fotos, errores, estados de foco y reglas responsive del modal.
8. Ejecutar la aplicación y revisar `/` en desktop y móvil, comprobando apertura desde ambos activadores, selección única, validación, reinicio, cierre, foco y ausencia de scroll horizontal.

## Acceptance criteria

- [ ] `/` carga sin errores de renderizado.
- [ ] Pulsar «Nueva publicación» abre el modal sin navegar a otra ruta.
- [ ] Pulsar el compositor «Compartí un momento…» abre el mismo modal sin navegar a otra ruta.
- [ ] El modal reproduce los textos y las secciones principales de `crear-publicacion.dc.html`.
- [ ] La sección «Para» muestra exactamente «Mateo», «Sofía», «Benjamín» y «Toda la sala».
- [ ] Solo un destinatario puede estar seleccionado al mismo tiempo.
- [ ] La sección «Tipo» muestra exactamente «Comida», «Siesta», «Actividad», «Logro», «Ánimo», «Foto» y «Anuncio».
- [ ] Solo una categoría puede estar seleccionada al mismo tiempo.
- [ ] El destinatario, el tipo y la descripción aparecen vacíos al abrir el modal.
- [ ] Publicar sin destinatario muestra un error inline y mantiene el modal abierto.
- [ ] Publicar sin tipo muestra un error inline y mantiene el modal abierto.
- [ ] Publicar con una descripción vacía o compuesta solo por espacios muestra un error inline y mantiene el modal abierto.
- [ ] Los errores están relacionados semánticamente con sus controles y los controles inválidos exponen `aria-invalid`.
- [ ] Publicar con todos los datos válidos cierra el modal.
- [ ] Publicar con datos válidos no añade, elimina ni modifica publicaciones del feed.
- [ ] «Agregar» es accesible y no abre un selector de archivos ni modifica el formulario.
- [ ] Cancelar cierra el modal sin conservar los valores introducidos.
- [ ] Cada nueva apertura muestra los campos vacíos y sin errores.
- [ ] Escape no cierra el modal.
- [ ] Pulsar el overlay no cierra el modal.
- [ ] El foco entra en el modal al abrirlo, no escapa de él mediante Tab y vuelve al activador al cerrarlo.
- [ ] Los activadores, controles, errores y acciones conservan foco visible y nombres accesibles.
- [ ] `/` y el modal se pueden usar en viewport desktop sin scroll horizontal.
- [ ] `/` y el modal se pueden usar en viewport móvil sin scroll horizontal.
- [ ] `npx tsc --noEmit` termina correctamente.
- [ ] `npm run build` termina correctamente.
- [ ] `npm run lint` no introduce errores nuevos en los archivos de aplicación modificados por esta spec.
- [ ] La comparación manual en navegador confirma la réplica visual del modal en desktop y móvil.

## Decisions

- **Sí:** implementar el flujo como modal sobre `/`. Es la interacción solicitada para el botón «Nueva publicación» y el compositor del feed.
- **Sí:** reutilizar un único modal desde la sidebar y el compositor. Evita duplicar estado y comportamiento.
- **Sí:** crear `app/create-post-modal.tsx`. Aísla la interacción cliente del feed estático de `app/page.tsx`.
- **Sí:** usar exactamente cuatro destinatarios y siete categorías visibles en la referencia. Evita introducir datos no presentes en la pantalla solicitada.
- **Sí:** exigir un único destinatario y una única categoría. Cada publicación debe tener una clasificación y un destino inequívocos.
- **Sí:** iniciar los campos vacíos. El modal representa una creación nueva y no un formulario de edición precargado.
- **Sí:** exigir descripción no vacía tras recortar espacios. Evita publicaciones sin contenido sin imponer un límite de caracteres no definido.
- **Sí:** mostrar errores inline accesibles. Permite identificar y corregir cada dato inválido dentro del modal.
- **Sí:** cerrar solo con «Cancelar» o con publicación válida. Mantiene la política de cierre explícito de los modales anteriores.
- **Sí:** reiniciar el formulario en cada apertura. No existe un contrato para conservar borradores.
- **Sí:** mantener la publicación válida solo como una acción de validación y cierre. SPEC 01 define un feed estático y la persistencia requiere otra spec.
- **Sí:** mantener «Agregar» como no-op accesible. La subida de imágenes necesita definir almacenamiento, límites y errores propios.
- **Sí:** implementar gestión completa de foco. El modal debe ser usable con teclado y devolver el foco a su origen.
- **No:** añadir la publicación al feed. Cambiaría el modelo estático y el alcance de SPEC 01.
- **No:** usar persistencia local o remota. No existe todavía un contrato de datos para publicaciones.
- **No:** cerrar mediante Escape u overlay. El cierre queda limitado a acciones explícitas.
- **No:** implementar selección o subida de fotografías. La referencia visual no define todavía un flujo de archivos.

## Risks

| Risk | Mitigation |
| --- | --- |
| Convertir el home en cliente puede alterar el renderizado estático del feed | Aislar la interacción en `app/create-post-modal.tsx` y mantener la estructura y los datos del feed sin cambios funcionales. |
| Los chips pueden permitir selecciones múltiples por error | Representar destinatarios y tipos como grupos de controles de selección única y verificar que solo exista una opción activa por grupo. |
| El foco puede escapar o perderse al cerrar el modal | Guardar el activador, enfocar el primer control al abrir, mantener el ciclo de foco y restaurarlo al cerrar. |
| Los valores o errores pueden conservarse entre aperturas | Centralizar el reinicio del formulario al abrir y después de cada cierre. |
| El modal puede desbordarse en móvil | Limitar la superficie, permitir scroll vertical interno y comprobar explícitamente la ausencia de scroll horizontal. |
| La acción visual de fotos puede interpretarse como una subida funcional | Mantenerla como control no operativo y documentar explícitamente la exclusión de archivos y persistencia. |
| El lint global puede incluir errores legacy de `references/pantallas/` | Separar los errores preexistentes de la validación de los archivos de aplicación modificados por esta spec. |

## What is **not** in this spec

- Añadir publicaciones nuevas al feed.
- Persistencia local o remota de publicaciones.
- API, base de datos, estados de carga o errores de servidor.
- Edición o eliminación de publicaciones existentes.
- Destinatarios dinámicos o integración con todos los registros de `app/kids/data.ts`.
- Selección, previsualización, subida o almacenamiento de fotografías.
- Likes, comentarios, notificaciones o permisos por rol.
- Cierre mediante Escape u overlay.

Cada una de estas capacidades requiere una spec independiente.
