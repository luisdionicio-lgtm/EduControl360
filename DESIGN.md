---
name: Cuaderno académico — EduControl 360
description: Portal académico de lectura clara, con navegación navy y acciones índigo.
colors:
  canvas: "#f7f9fd"
  surface: "#fff"
  ink: "#151b32"
  muted: "#59637a"
  accent: "#4f46d5"
  brand: "#6258f7"
  line: "#dae0ec"
  navy: "#0b1020"
  success: "#087e65"
  error: "#b42338"
  soft-accent: "#eeedff"
  soft-accent-ink: "#433aa5"
  nav-active: "#302c60"
  nav-hover: "#22243d"
  button-hover: "#3f37b4"
  secondary-hover: "#dedbff"
  input-border: "#b7c0d3"
  notice: "#fff5df"
  notice-ink: "#78521a"
typography:
  headline:
    fontFamily: '"Plus Jakarta Sans Variable", sans-serif'
    fontSize: "clamp(28px, 3vw, 40px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontFamily: '"Plus Jakarta Sans Variable", sans-serif'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  body:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: "16px"
  table:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: "14px"
  label:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: "14px"
    fontWeight: 600
rounded:
  panel: "12px"
  control: "8px"
  badge: "6px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  panel: "28px"
  xl: "32px"
  workspace: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-secondary:
    backgroundColor: "{colors.soft-accent}"
    textColor: "{colors.soft-accent-ink}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
    textColor: "{colors.soft-accent-ink}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "28px"
  badge:
    backgroundColor: "{colors.soft-accent}"
    textColor: "{colors.soft-accent-ink}"
    rounded: "{rounded.badge}"
    padding: "6px 10px"
---

# Design System: Cuaderno académico

## Overview

**Creative North Star: "Cuaderno académico"**

Dirección confirmada por el usuario para EduControl 360. La interfaz web prioriza al estudiante que consulta cursos y calificaciones desde una laptop o un teléfono. La navegación institucional oscura enmarca superficies claras y registros académicos alineados.

La expresión es institucional y legible. Los estados y los datos publicados tienen prioridad sobre la decoración. El entorno de desarrollo es Windows; el producto es una aplicación web responsive.

**Key Characteristics:**
- Navegación navy y acciones índigo.
- Datos académicos alineados, con cifras tabulares.
- Contexto institucional persistente y estados escritos.
- Lectura móvil mediante filas apiladas y etiquetadas.

## Colors

### Primary

El índigo de acción (`accent`) identifica botones y enlaces. El índigo de marca (`brand`) identifica iconos y el foco de teclado. La selección de navegación usa `nav-active`; el paso del puntero usa `nav-hover`.

### Neutral

`canvas` es el fondo de la aplicación; `surface`, el de paneles y campos. `ink` sostiene la lectura y `muted` la información secundaria. `line` separa filas y delimita paneles. `navy` define la navegación y el relato de acceso.

### Semantic states

`success` identifica confirmaciones visuales; `error`, errores de formulario. Los avisos de prerrequisitos usan `notice` y `notice-ink`. La selección de gestión, los botones secundarios y los códigos de estudiante usan `soft-accent` y `soft-accent-ink`. Los estados mantienen texto: el color no sustituye su significado.

## Typography

**Body Font:** Geist Variable, con sans-serif de respaldo.
**Heading Font:** Plus Jakarta Sans Variable, con sans-serif de respaldo.

Las fuentes se importan localmente mediante los paquetes `@fontsource-variable` en el layout raíz. No se usa una fuente monoespaciada para notas: las tablas activan cifras tabulares con `font-variant-numeric`.

El título principal usa el tamaño fluido del frontmatter; los títulos secundarios usan 22px y los de tercer nivel 17px, todos con interlineado 1.25 y tracking -0.03em. El cuerpo hereda 16px del navegador; los párrafos usan interlineado 1.65 y ancho máximo 70ch. Las tablas usan 14px, sus encabezados 12px y las notas 20px/700. Etiquetas de formulario: 14px/600; insignias: 12px/650.

## Layout

En escritorio, el shell tiene un rail de 244px y contenido flexible con mínimo cero; ocupa al menos 100dvh. El rail usa padding 32px 20px. El área principal usa 48px laterales e inferiores; el encabezado tiene mínimo 88px de alto y separación inferior de 40px. Los paneles tienen padding 28px y margen superior 24px. La gestión organiza dos columnas iguales; el patrón de dos columnas del sistema usa proporción 1.6:1. Los formularios tienen un ancho máximo de 620px.

Hasta 1000px el rail pasa a 210px, el contenido a 28px laterales y 32px inferiores, y ambas rejillas pasan a una columna.

Hasta 700px el shell se convierte en bloque. El rail funciona como encabezado superior con padding 20px; sus enlaces forman una fila horizontal desplazable sin partir sus textos. Se oculta el pie del rail. El contenido usa 20px laterales y 32px inferiores, el encabezado mide al menos 72px y los paneles tienen padding 20px. La introducción se apila y el selector institucional puede ocupar otra línea.

Las tablas son completas en escritorio, dentro de regiones con nombre y foco de teclado. En móvil su contenedor deja de desplazar horizontalmente: cada fila se vuelve una rejilla de dos columnas con gap 16px y padding vertical 20px; la primera celda ocupa ambas columnas. Los encabezados se ocultan visualmente y cada celda muestra su `data-label`. Los textos largos pueden partirse. No describir este patrón como una tabla móvil que requiere desplazamiento lateral.

## Elevation & Depth

El sistema implementado es plano: no define sombras. El fondo claro, los paneles blancos, los bordes y los divisores crean jerarquía; el rail navy establece el límite espacial principal.

## Shapes

Los paneles usan curvas de 12px; botones, campos, enlaces del rail y selectores de gestión, 8px; insignias, 6px. Los paneles y campos tienen borde de 1px. Los controles principales tienen altura mínima de 44px. El checkbox visible mide 22px; su campo usa una rejilla de 22px y una columna flexible, con etiqueta asociada activable de al menos 44px de alto.

## Components

### Buttons and fields

El botón principal usa índigo de acción, texto blanco, peso 600 y padding 12px 20px. En hover cambia a `button-hover`. El secundario usa el par índigo claro; en hover cambia a `secondary-hover` y conserva el texto `soft-accent-ink`. El estado deshabilitado usa opacidad .55 y cursor de prohibición. Los campos tienen padding 12px, borde `input-border`, fondo blanco y etiqueta asociada explícitamente en los formularios de gestión.

El foco visible global tiene contorno de 3px en índigo de marca y offset 4px. El enlace «Saltar al contenido» aparece al recibir foco y apunta al main. Los botones y enlaces usan `touch-action: manipulation`.

### Navigation

La navegación principal es un `nav` con nombre y enlaces reales; la ruta activa usa `aria-current="page"`. Conserva el contexto de institución en sus destinos. La gestión usa otro `nav` con nombre y botones `aria-pressed` para cambiar contenido local: no implementa el patrón ARIA tablist ni navegación con flechas propia de tabs. En móvil ambas filas pueden desplazarse horizontalmente.

### Academic records

Los cursos, notas, asistencia y horario usan tablas con regiones nombradas y `tabIndex=0`. Las notas muestran dos decimales, escala sobre 20 y fecha de publicación; la vista indica que solo muestra calificaciones publicadas. El diseño móvil conserva etiquetas visibles en cada dato.

### Feedback

La carga del campus usa `role="status"`. Los formularios de gestión muestran «Guardando…» y bloquean el envío durante la petición; los errores usan `role="alert"` y las confirmaciones `role="status"`. La falta de opciones previas muestra un aviso escrito y bloquea el envío. La verificación de dominio usa texto de estado. Las vistas académicas incluyen mensajes separados para ausencia de matrícula, notas, asistencia u horarios. Esta documentación no atribuye a estos componentes un error global recuperable o una pantalla propia de acceso prohibido que no se haya verificado.

La única transición declarada es el color de fondo de botones (160ms, ease-out). `prefers-reduced-motion: reduce` elimina transiciones y animaciones y restablece el desplazamiento automático en todos los elementos y pseudoelementos.

## Do's and Don'ts

### Do:
- **Do** conservar los nombres de estado, las etiquetas de campo y el contexto institucional.
- **Do** usar cifras tabulares y etiquetas por celda en los registros móviles.
- **Do** respetar el foco visible y la preferencia de movimiento reducido.

### Don't:
- **Don't** presentar datos inventados como información académica real.
- **Don't** llamar tabs ARIA a los botones de gestión con `aria-pressed`.
- **Don't** sustituir las fuentes confirmadas por una tipografía distinta.
