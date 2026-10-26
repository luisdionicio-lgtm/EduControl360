---
name: Campus Atelier — EduControl 360
description: Portal académico principalmente oscuro, grafito, violeta y lima.
colors:
  canvas: "#11131c"
  surface: "#1b1e2a"
  surface-raised: "#222635"
  ink: "#f1f2f8"
  muted: "#a4aabd"
  accent: "#a99aff"
  brand: "#a99aff"
  lime: "#d4edb2"
  line: "#303446"
  navy: "#151721"
  success: "#b7dfa0"
  feature: "#b0a1f6"
  feature-ink: "#241d3c"
  date: "#d7ecb2"
  date-ink: "#2d3b20"
  button-ink: "#211a34"
  button-hover: "#c1b5ff"
  secondary: "#2b2a40"
  secondary-ink: "#d6cbff"
  secondary-hover: "#3b3655"
  input: "#151824"
  input-border: "#777d97"
  error: "#ff9cac"
  notice: "#3b3123"
  notice-ink: "#e3c595"
  nav-active: "#302b47"
  nav-active-ink: "#dcd5ff"
  nav-hover: "#242736"
typography:
  headline:
    fontFamily: '"Sora Variable", sans-serif'
    fontSize: "clamp(28px, 2.6vw, 36px)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.03em"
  title:
    fontFamily: '"Sora Variable", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.03em"
  body:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: "15px"
    lineHeight: 1.65
  label:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: "12px"
    fontWeight: 500
rounded:
  control: "10px"
  date: "12px"
  course: "14px"
  panel: "16px"
spacing:
  control: "12px 18px"
  panel: "26px"
  feature: "28px"
  workspace: "0 36px 24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.button-ink}"
    rounded: "{rounded.control}"
    padding: "{spacing.control}"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.control}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
---

# Design System: Campus Atelier

## Overview

**Creative North Star: Campus Atelier nocturno.** Un espacio académico de grafito con orientación violeta, fechas lima y lectura clara. Esta dirección principalmente oscura, confirmada por el usuario, sustituye Cuaderno académico. La referencia implementada es `apps/web/src/app/globals.css` y los componentes actuales; este documento describe su estado, no una propuesta futura.

El estudiante encuentra institución, cursos, notas y agenda. La voz es española, institucional y directa; docentes y administradores conservan sus operaciones por membresía. La identidad se construye con tipografía y superficies sólidas, sin halos neón ni imágenes decorativas.

**Key Characteristics:**

- Grafito por defecto, violeta para orientación y acción, lima para fecha y avance.
- Sora en títulos, Geist en lectura, iconos Lucide.
- Datos reales en el producto; demo explícita con datos ficticios persistentes.

## Colors

Los valores normativos están en el frontmatter. Los nombres `canvas`, `surface`, `surface-raised`, `ink`, `muted`, `accent`, `brand`, `lime`, `line`, `navy` y `success` corresponden a propiedades CSS existentes.

### Primary

Violeta `accent` identifica enlaces, foco y botones. El gran panel de orientación usa `feature`, con tinta oscura `feature-ink`; no intercambiarlo automáticamente con `accent`.

### Secondary

Lima `lime` resalta selección de texto y elementos de avance; el bloque de fecha utiliza su propio color observado `date`. Los cursos tienen tonos locales definidos por `--tone`; no representan por sí solos un estado semántico.

### Neutral

`canvas` sostiene la página; `navy` el rail; `surface` y `surface-raised` separan contenidos mediante tono y líneas. Texto principal `ink` y secundario `muted`. Error rosado, éxito verde y avisos ámbar llevan texto explicativo, sin depender solo del color.

## Typography

**Display Font:** Sora Variable, sans-serif. **Body Font:** Geist Variable, sans-serif. No hay una tercera familia mono.

H1 usa el tamaño fluido del frontmatter; H2 18px y H3 15px, peso 600, con ajustes locales. Los títulos de cursos usan 550 y 14px en escritorio. El panel violeta usa `clamp(23px, 2.1vw, 29px)` y tracking -0.04em. La portada demo usa `clamp(36px, 4vw, 56px)` y peso 550. Los párrafos generales tienen máximo 70ch; las descripciones y metadatos son más compactos. El tamaño base 15px no sustituye los tamaños locales de 8–13px que existen en el dashboard; su legibilidad requiere revisión visual y no equivale a una certificación de accesibilidad.

## Layout

Shell de dos columnas: rail sticky de 238px y contenido flexible, altura mínima 100dvh. Workspace con 36px laterales. Dashboard con columna principal y lateral de 288px, gap 24px. Cursos, métricas y agenda forman grupos distintos; no convertir todo el contenido en tablas.

- Desde 1600px: workspace 46px laterales y lateral de dashboard 315px.
- Hasta 1220px: rail 218px, workspace 27px; dashboard de una columna y paneles laterales en dos columnas.
- Hasta 900px: rail 198px, workspace 22px; cursos y rejillas de gestión/detalle pasan a una columna.
- Hasta 760px: rail oculto y menú nativo `details/summary`; workspace 20px. Dashboard ordenado: orientación, métricas, cursos, agenda, rendimiento, notas recientes y próximas evaluaciones. Login, perfiles demo y explicaciones pasan a una columna.
- Hasta 420px: panel de orientación vertical, fecha horizontal; se oculta la fecha secundaria de la lista de notas.

Tablas en escritorio permiten desplazamiento horizontal. Hasta 760px, cada fila se transforma en una rejilla de dos columnas con primera celda de ancho completo y etiquetas `data-label`; el encabezado permanece visualmente oculto. Mantener estas etiquetas al añadir columnas.

## Elevation & Depth

Profundidad por contraste tonal, bordes y separación; la hoja global no define sombras. Las tarjetas de curso se elevan 3px al hover; los perfiles demo 4px. Botones desplazan 1px al pulsar. Transiciones habituales de 160ms, perfiles de 180ms; desplazamientos con `cubic-bezier(0.16, 1, 0.3, 1)` y color con `ease-out`. El spinner gira en 900ms. `prefers-reduced-motion: reduce` elimina animaciones y transiciones y restaura scroll automático.

## Shapes

Paneles y orientación de 16px; cursos de 14px; fecha de 12px; botones, campos y enlaces de navegación de 10px. Avatares circulares, indicadores pequeños redondos y barras de progreso de 4px. Bordes de 1px dividen superficies sin añadir sombras.

## Components

### Buttons

Acción principal violeta con tinta oscura, mínimo 44px, padding 12px 18px y texto 12px/600. Hover más claro; variante secundaria oscura y variante `dark-button` de 38px dentro del panel violeta. Disabled usa opacidad 0.5 y cursor no permitido. Foco visible global de 3px en `accent`, separado 4px. No afirmar que todos los controles alcanzan 44px: existen variantes compactas.

### Cards / Containers

Panel general de 26px de padding, 21px en móvil. Curso enlazable con borde, padding 18px 16px y progreso de evaluaciones publicadas. Los porcentajes y promedios derivan de datos académicos; no sustituir valores ausentes por resultados inventados. La fecha lima pertenece a la próxima clase; sin próxima clase se muestra un icono y mensaje alternativo.

### Inputs / Fields

Campos oscuros, borde `input-border`, mínimo 46px y radio 10px. Foco cambia borde a `accent` y mantiene outline. Checkbox de 21px con etiqueta activable de mínimo 44px. Estados de error, aviso y vacío son texto contextual. Los campos conservan 13px incluso en móvil; no se documenta prevención universal del zoom en iOS.

### Navigation

Enlaces con icono y texto; activo vía `aria-current="page"`, fondo violeta oscuro e indicador. Hover grafito más claro. Menú móvil nativo desplegable, con enlaces en dos columnas. Institución y rol determinan navegación y permisos; conservar el contexto de institución en rutas.

### Agenda

Selector semanal de botones con `aria-pressed`, marcas de días con clases y resultados en región `aria-live="polite"`. Estado vacío explícito para días sin clases. Fechas presentadas en español de Perú y zona America/Lima.

### Demo y autenticación

Tres perfiles locales explícitos: estudiante Lucía Torres, docente Diego Mendoza y administradora Valeria Ríos. Al entrar, todos los perfiles se deshabilitan; el elegido muestra spinner y «Abriendo tu espacio…». Error mediante `role="alert"`. El shell demo muestra «Demo local» y «Datos ficticios · Cambios persistentes», con cambio de perfil. Es un proveedor distinto de Google; los secretos y datos demo permanecen separados. No presentar credenciales Google pendientes ni módulos futuros como disponibles.

## Do's and Don'ts

- **Do** reutilizar los tokens oscuros y los tamaños locales antes de añadir variantes.
- **Do** mantener estados vacíos, pendientes, error y contexto de institución.
- **Do** preservar foco, teclado, texto de estados y movimiento reducido. WCAG 2.2 AA es un objetivo, no un resultado certificado por este documento.
- **Don't** reintroducir la paleta clara Cuaderno ni Plus Jakarta Sans.
- **Don't** añadir halos neón, sombras arbitrarias ni imágenes sin procedencia.
- **Don't** confundir datos ficticios persistentes con producción o autenticación Google.
