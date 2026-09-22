# SPEC 01 — Home Feed de OpenDayCare

> **Status:** Implementado
> **Depends on:** None
> **Date:** 2026-09-22
> **Objective:** Reemplazar la pantalla inicial de Next.js por un home estático responsive que replique visualmente el feed de `references/pantallas/feed.dc.html`.

## Scope

**In:**

- Implementar el feed como pantalla principal en `app/page.tsx`.
- Reproducir la composición visual de la referencia: sidebar, cabecera del feed, compositor de publicación y tres tarjetas de publicaciones.
- Mantener el contenido estático de la referencia: Caro, Mateo, textos, fechas, contadores, etiquetas y datos visibles.
- Aplicar la paleta, espaciado, bordes, sombras, tipografías Fredoka y Nunito, iconografía y estados visuales de la referencia.
- Adaptar la composición para escritorio y móvil.
- Actualizar `app/layout.tsx` con metadatos y configuración de idioma coherentes con OpenDayCare.
- Actualizar `app/globals.css` con los estilos globales necesarios para la réplica.
- Mantener semántica HTML, nombres accesibles, foco de teclado y contraste razonable.
- Mantener los elementos interactivos como affordances visuales con destinos inertes (`#`).

**Out of scope (for future specs):**

- Autenticación, cierre de sesión real o gestión de sesiones.
- Base de datos, API, persistencia o carga dinámica de publicaciones.
- Crear, editar, eliminar o compartir publicaciones.
- Likes, comentarios y contadores funcionales.
- Rutas o pantallas adicionales para Niños, Avisos, Mi cuenta, detalle de publicación o foto.
- Subida o gestión de imágenes.
- Panel de administración, permisos o roles reales.

## Data model

This feature introduces no new data structures. It renders fixed presentation data directly in the home and does not persist or fetch information.

## Implementation plan

1. Reemplazar el contenido inicial de `app/page.tsx` por la estructura semántica del home: navegación lateral, contenido principal, cabecera, acceso visual a nueva publicación y listado de publicaciones estáticas.
2. Añadir en `app/page.tsx` los textos, estados, contadores, enlaces inertes e iconos necesarios para que las tres tarjetas coincidan con `feed.dc.html`, manteniendo etiquetas accesibles y foco visible.
3. Actualizar `app/globals.css` para definir la paleta crema/coral, tipografías, reset básico, scrollbar, tarjetas, navegación y reglas responsive sin depender del estilo de la plantilla inicial.
4. Actualizar `app/layout.tsx` para cargar Fredoka y Nunito mediante Google Fonts, establecer `lang="es"` y definir metadatos de OpenDayCare.
5. Ejecutar la aplicación y revisar el home en un viewport de escritorio y otro móvil, corrigiendo únicamente diferencias visuales o problemas de desbordamiento frente a la referencia.

## Acceptance criteria

- [X] La ruta `/` carga el home de OpenDayCare sin errores de renderizado.
- [X] El home contiene sidebar, marca OpenDayCare, botón Nueva publicación, navegación Feed/Niños/Avisos/Mi cuenta y perfil de Caro.
- [X] El contenido principal muestra el encabezado de Sala Soles, el saludo, la fecha, el compositor y la sección PUBLICADO HOY.
- [X] Se muestran exactamente tres publicaciones estáticas: un logro de Mateo, una actividad con foto y un anuncio general.
- [X] Los textos, nombres, horas, destinatarios, etiquetas y contadores coinciden con la referencia `feed.dc.html`.
- [X] La paleta, tipografías Fredoka y Nunito, tamaños, bordes redondeados, sombras y espaciado son visualmente equivalentes a la referencia.
- [X] La pantalla conserva una composición usable en viewport de escritorio sin desbordamiento horizontal.
- [X] La pantalla conserva una composición usable en viewport móvil sin desbordamiento horizontal y con navegación legible.
- [X] Los enlaces visuales usan destinos inertes y no intentan acceder a autenticación, API o rutas no implementadas.
- [X] Los elementos interactivos tienen nombre accesible y pueden recibir foco de teclado visible.
- [X] `npm run lint` termina correctamente, considerando únicamente los archivos de aplicación modificados por esta spec.
- [X] `npm run build` termina correctamente.
- [X] La comparación manual en navegador confirma la réplica en viewport desktop y móvil.

## Decisions

- **Sí:** contenido completamente estático. No existe autenticación ni base de datos y la referencia debe reproducirse sin inventar un modelo de datos.
- **No:** capa de datos, persistencia o API. Sería alcance de una spec posterior.
- **Sí:** limitar los cambios a `app/page.tsx`, `app/layout.tsx` y `app/globals.css`. La pantalla no necesita nuevas rutas, componentes o imágenes.
- **Sí:** soportar escritorio y móvil. La pantalla debe ser usable en ambos tamaños aunque la referencia esté compuesta principalmente para escritorio.
- **Sí:** cargar Fredoka y Nunito desde Google Fonts. Es la forma más directa de igualar la tipografía de la referencia.
- **Sí:** usar enlaces inertes (`#`) para las acciones sin destino implementado. Así se conserva la apariencia interactiva sin crear rutas ficticias.
- **Sí:** incluir semántica y accesibilidad básica. La fidelidad visual no debe impedir navegación por teclado ni lectura asistida.
- **No:** implementar acciones de publicación, edición, likes, comentarios o navegación secundaria. Cada flujo requiere una spec propia cuando exista backend o persistencia.

## Risks

| Risk | Mitigation |
| --- | --- |
| Google Fonts no disponible durante la carga | Definir familias de fallback del sistema para conservar legibilidad y proporciones razonables. |
| La sidebar y las tarjetas pueden desbordar en móvil | Añadir reglas responsive y comprobar explícitamente un viewport móvil sin scroll horizontal. |
| El lint del repositorio incluye archivos legacy de `references/pantallas/` | Separar los errores preexistentes de la validación de los tres archivos de aplicación modificados. |

## What is **not** in this spec

- Autenticación ni base de datos.
- Datos dinámicos, persistencia o API.
- Publicar, editar, eliminar, dar likes o comentar.
- Rutas y pantallas secundarias.
- Subida de imágenes.

Cada una de estas capacidades requiere una spec independiente.
