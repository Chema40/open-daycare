# SPEC 02 — Niños y perfiles

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-09-22
> **Objective:** Implementar la pantalla estática de gestión de niños en `/kids` y perfiles navegables mediante ID numérico o slug en `/kids/[identifier]`, replicando las referencias visuales proporcionadas.

## Scope

**In:**

- Implementar la pantalla de listado de niños en `app/kids/page.tsx`.
- Implementar la pantalla dinámica de perfil en `app/kids/[identifier]/page.tsx`.
- Crear un modelo estático compartido en `app/kids/data.ts` con los ocho niños mostrados en `references/pantallas/ninos.dc.html`.
- Mostrar el listado agrupado en Sala Soles con nombres, edades, padres vinculados, etiquetas y estados visibles de la referencia.
- Permitir acceder al listado desde el enlace `Niños` del menú de `app/page.tsx` usando la ruta `/kids`.
- Hacer que cada tarjeta del listado navegue a un perfil mediante un identificador estable.
- Resolver cada perfil mediante un ID numérico y un slug legible, por ejemplo `/kids/1` y `/kids/mateo-fernandez`.
- Mostrar en los perfiles la información estática de la referencia: encabezado, edad, sala, alergias y notas, fecha de nacimiento, ingreso y padres vinculados.
- Mantener los botones y enlaces de acciones secundarias como affordances visuales con destino inerte (`#`): Agregar niño, Editar, Resumen del día y Vincular otro padre.
- Mantener el campo de búsqueda como elemento visual sin filtrado funcional.
- Reutilizar la navegación lateral, la marca, el perfil de Caro y la identidad visual de `SPEC 01`.
- Adaptar las pantallas a escritorio y móvil sin scroll horizontal.
- Mantener semántica HTML, nombres accesibles, foco de teclado y contraste razonable.
- Actualizar `app/globals.css` con los estilos compartidos y responsive necesarios para las nuevas pantallas.

**Out of scope (for future specs):**

- API, base de datos, autenticación, permisos o roles reales.
- Carga dinámica, creación, edición o eliminación de niños.
- Persistencia de niños, perfiles, alergias, padres vinculados o cambios de sala.
- Búsqueda o filtrado funcional del listado.
- Vinculación real de padres o gestión de invitaciones.
- Implementación de Resumen del día.
- Implementación de las pantallas Agregar niño, Editar o Vincular otro padre.
- Estados de carga, error o listado vacío.
- Subida de fotografías o gestión de avatares.

## Data model

El modelo será estático y vivirá en `app/kids/data.ts`. Cada niño tendrá un ID numérico, un slug y los datos necesarios para representar ambas referencias:

```ts
type LinkedParent = {
  name: string;
  relationship: string;
  status: "active" | "pending";
  initial: string;
  color: string;
};

type Kid = {
  id: number;
  slug: string;
  name: string;
  initial: string;
  age: number;
  room: string;
  avatarColor: string;
  avatarTextColor: string;
  tags: string[];
  birthDate: string;
  admissionDate: string;
  notes?: string;
  linkedParents: LinkedParent[];
};
```

El módulo expondrá una colección estática de ocho niños y una función de resolución por `id` numérico o `slug`. No habrá lectura ni escritura en `localStorage`, archivos, API o base de datos.

## Implementation plan

1. Crear `app/kids/data.ts` con los ocho registros estáticos de Sala Soles, incluyendo IDs, slugs y los textos visibles en el listado y en los perfiles.
2. Crear `app/kids/page.tsx` con el shell de navegación, encabezado de gestión, acción visual Agregar niño, buscador no funcional, contador de niños y tarjetas enlazadas a identificadores estables.
3. Crear `app/kids/[identifier]/page.tsx` con la resolución del identificador numérico o slug y el perfil estático basado en `perfil-nino.dc.html`, incluyendo navegación de regreso a `/kids`.
4. Añadir en `app/page.tsx` el destino real `/kids` al enlace Niños del menú, manteniendo Feed como la sección activa únicamente en la ruta `/`.
5. Actualizar `app/globals.css` para compartir el shell visual con las nuevas rutas, reproducir la paleta y tipografías de las referencias, y adaptar sidebar, tarjetas y perfil a móvil.
6. Ejecutar la aplicación y revisar `/`, `/kids`, `/kids/1` y `/kids/mateo-fernandez` en viewport desktop y móvil, corrigiendo desbordamientos, enlaces incorrectos o diferencias visuales evidentes.

## Acceptance criteria

- [X] La ruta `/kids` carga sin errores de renderizado.
- [X] La ruta `/kids` es accesible desde el enlace Niños del menú del home.
- [X] `/kids` muestra exactamente ocho niños agrupados bajo Sala Soles.
- [X] Cada tarjeta muestra el nombre, edad, padres vinculados y etiqueta o estado correspondiente a la referencia.
- [X] El buscador aparece visualmente y no altera la lista al escribir.
- [X] Las acciones Agregar niño y las acciones de perfil mantienen apariencia interactiva y destino inerte (`#`).
- [X] Cada niño de la lista enlaza a un perfil identificable.
- [X] Un ID numérico válido, como `/kids/1`, muestra el perfil correspondiente.
- [X] Un slug válido, como `/kids/mateo-fernandez`, muestra el mismo perfil correspondiente.
- [X] Los perfiles de los ocho niños pueden abrirse desde sus tarjetas sin depender de API o persistencia.
- [X] El perfil muestra nombre, edad, sala, alergias o notas, fecha de nacimiento, ingreso y padres vinculados cuando existan.
- [X] El enlace Volver a Niños devuelve a `/kids`.
- [X] La navegación lateral, marca OpenDayCare y perfil de Caro mantienen la composición visual del home.
- [X] La paleta, tipografías Fredoka y Nunito, tamaños, bordes, sombras y espaciado son visualmente equivalentes a las referencias.
- [X] `/kids` y los perfiles se pueden usar en viewport desktop sin scroll horizontal.
- [X] `/kids` y los perfiles se pueden usar en viewport móvil sin scroll horizontal.
- [X] Los elementos interactivos tienen nombres accesibles y foco de teclado visible.
- [X] `npm run lint` termina correctamente considerando los archivos de aplicación modificados por esta spec.
- [X] `npm run build` termina correctamente.
- [X] La comparación manual en navegador confirma la réplica visual en `/kids` y un perfil tanto en desktop como en móvil.

## Verification notes

- Verificados `/kids`, `/kids/1` y `/kids/mateo-fernandez` con Playwright en viewports desktop (1440×900) y móvil (390×844); no hubo errores de renderizado ni scroll horizontal.
- Comprobados los ocho slugs de perfil, el enlace `Niños`, el enlace `Volver a Niños`, los destinos `#`, nombres accesibles y foco visible.
- El buscador conserva los ocho registros después de escribir.
- Evidencia visual: `.playwright-mcp/kids-desktop-1440.png`, `.playwright-mcp/profile-desktop-1440.png`, `.playwright-mcp/profile-mobile-390.png`, `.playwright-mcp/reference-kids-desktop.png` y `.playwright-mcp/reference-profile-desktop.png`.
- `npx tsc --noEmit` y `npm run build` finalizaron correctamente. `npm run lint` reportó errores únicamente en `references/pantallas/support.js`, fuera de los archivos de aplicación de esta spec.

## Decisions

- **Sí:** contenido completamente estático. La spec amplía la réplica visual iniciada por SPEC 01 sin introducir backend.
- **Sí:** usar ocho niños y un perfil navegable para cada uno. Todas las tarjetas de la referencia deben tener un destino coherente.
- **Sí:** aceptar IDs numéricos y slugs. Esto cubre URLs compactas y URLs legibles sin exigir una fuente de datos externa.
- **Sí:** resolver ambos identificadores contra el mismo registro estático. `/kids/1` y `/kids/mateo-fernandez` representan al mismo niño.
- **Sí:** centralizar los datos en `app/kids/data.ts`. Evita duplicar los registros entre el listado y los perfiles.
- **Sí:** mantener búsqueda, alta, edición, resumen y vinculación como affordances visuales. Sus flujos necesitan specs independientes.
- **Sí:** mostrar únicamente el estado poblado. Carga, error y listado vacío pertenecen a una futura capa de datos.
- **Sí:** adaptar la sidebar existente para móvil. No se añade una navegación móvil distinta a la referencia.
- **No:** usar una API, base de datos o persistencia. No existe todavía un contrato de datos ni autenticación que lo justifique.
- **No:** crear rutas ficticias para las acciones secundarias. Los destinos inertes conservan la apariencia sin prometer funcionalidades no implementadas.

## Risks

| Risk | Mitigation |
| --- | --- |
| La resolución de IDs y slugs puede producir registros inconsistentes | Mantener un único registro por niño y resolver ambos valores contra la misma colección estática. |
| La pantalla de perfil puede desbordarse en móvil por sus dos columnas | Convertir el layout a una sola columna en viewport estrecho y comprobarlo manualmente. |
| La lista y el perfil pueden divergir visualmente respecto a la referencia | Compartir el modelo de `app/kids/data.ts` y validar ambas rutas con comparación visual. |
| El lint global puede incluir errores preexistentes de `references/pantallas/` | Separar los errores legacy de los archivos de aplicación modificados por esta spec. |

## What is **not** in this spec

- API, base de datos, autenticación, permisos o persistencia.
- Alta, edición o eliminación funcional de niños.
- Búsqueda o filtrado funcional.
- Vinculación real de padres o gestión de invitaciones.
- Resumen del día.
- Estados de carga, error o listado vacío.
- Fotografías o avatares subidos por usuarios.

Cada una de estas capacidades requiere una spec independiente.
