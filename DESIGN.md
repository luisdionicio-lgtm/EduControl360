---
name: Campus Atelier — EduControl 360
description: Portal académico luminoso con navegación navy y acentos azul, violeta, menta y naranja.
colors:
  canvas: "#eef3fc"
  surface: "#ffffff"
  surface-raised: "#f5f8ff"
  ink: "#142143"
  muted: "#536588"
  accent: "#215df5"
  brand: "#215df5"
  lime: "#d6efff"
  line: "#d4e0f5"
  navy: "#08162d"
  success: "#087c67"
  feature-start: "#d8eaff"
  feature-end: "#e8e5ff"
  feature-ink: "#122b60"
  date: "#ffffff"
  date-ink: "#1d55aa"
  button: "#155bf2"
  button-ink: "#ffffff"
  button-hover: "#0647d0"
  secondary: "#e4edff"
  secondary-ink: "#2354ae"
  secondary-hover: "#cddfff"
  input: "#f9fbff"
  input-border: "#758caf"
  error: "#ba2944"
  notice: "#fff4db"
  notice-ink: "#77541c"
  nav-active: "#253f70"
  nav-active-ink: "#ffffff"
  nav-hover: "#1d3558"
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
    backgroundColor: "{colors.button}"
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

**Creative North Star: Campus Atelier — referencia luminosa.** La última imagen del usuario («recuerda seguir así por dentro») confirma navegación navy oscura y superficies blancas/azules luminosas, con azul eléctrico, violeta, menta y naranja. Esta referencia sustituye la preferencia anterior por una interfaz principalmente oscura; no restaurar el antiguo Cuaderno ni sus tipografías.

El estado efectivo resulta de `reference-theme.css`, importado después de `globals.css`: los overrides gobiernan color y algunos acabados; la estructura, tipografía y responsive siguen mayormente en globals. El portal mantiene español institucional, Sora/Geist y datos académicos contextuales.

**Key Characteristics:**

- Rail navy, workspace azul muy claro y paneles blancos.
- Acción azul eléctrico; cursos azul, violeta y naranja; éxito menta.
- Demo explícita con datos ficticios persistentes y permisos por rol.

## Colors

El frontmatter registra los valores efectivos. `accent` y `brand` son azul eléctrico; el botón principal tiene un valor local propio `#155bf2`, distinto del token `accent`. El nombre heredado `lime` ahora contiene azul pálido y no describe una lima visible.

### Primary

Azul eléctrico para enlaces y foco (`accent`), botones (`button`) y agenda seleccionada (`#1e63ee`). El panel de orientación usa un degradado azul/violeta claro con tinta azul oscura.

### Secondary

Los tonos de cursos son `#1769ef`, `#8d43ed` y `#f18424`. Menta identifica éxito y asistencia; próximas evaluaciones usan fecha violeta clara. No interpretar los tonos de curso como estados semánticos.

### Neutral

Canvas azul pálido, panel blanco y tinta navy. El rail mantiene colores propios claros sobre navy: activo `#253f70`, texto blanco, hover `#1d3558`. El menú móvil es claro, activo `#e0ebff` con texto `#165bce`; no copiarle los colores del rail. Errores rojos y avisos ámbar conservan texto explicativo.

## Typography

**Display Font:** Sora Variable, sans-serif. **Body Font:** Geist Variable, sans-serif. No hay una tercera familia mono.

H1 usa el tamaño fluido del frontmatter; H2 18px y H3 15px, peso 600, con ajustes locales. Los títulos de cursos usan 550 y 14px en escritorio. El panel azul/violeta claro usa `clamp(23px, 2.1vw, 29px)` y tracking -0.04em. La portada demo usa `clamp(36px, 4vw, 56px)` y peso 550. Los párrafos generales tienen máximo 70ch; las descripciones y metadatos son más compactos. El tamaño base 15px no sustituye los tamaños locales de 8–13px que existen en el dashboard; su legibilidad requiere revisión visual y no equivale a una certificación de accesibilidad.

## Layout

Shell de dos columnas: rail sticky de 238px y contenido flexible, altura mínima 100dvh. Workspace con 36px laterales. Dashboard con columna principal y lateral de 288px, gap 24px. Cursos, métricas y agenda forman grupos distintos; no convertir todo el contenido en tablas.

- Desde 1600px: workspace 46px laterales y lateral de dashboard 315px.
- Hasta 1220px: rail 218px, workspace 27px; dashboard de una columna y paneles laterales en dos columnas.
- Hasta 900px: rail 198px, workspace 22px; cursos y rejillas de gestión/detalle pasan a una columna.
- Hasta 760px: rail oculto y menú nativo `details/summary`; workspace 20px. Dashboard ordenado: orientación, métricas, cursos, agenda, rendimiento, notas recientes y próximas evaluaciones. Login, perfiles demo y explicaciones pasan a una columna.
- Hasta 420px: panel de orientación vertical, fecha horizontal; se oculta la fecha secundaria de la lista de notas.

Tablas en escritorio permiten desplazamiento horizontal. Hasta 760px, cada fila se transforma en una rejilla de dos columnas con primera celda de ancho completo y etiquetas `data-label`; el encabezado permanece visualmente oculto. Mantener estas etiquetas al añadir columnas.

## Elevation & Depth

Profundidad principalmente por contraste tonal, bordes y separación. El override añade sombra a la fecha blanca: `0 8px 22px #5478ad1a`; no extenderla automáticamente a todas las tarjetas. Las tarjetas de curso se elevan 3px al hover; los perfiles demo 4px. Botones desplazan 1px al pulsar. Transiciones habituales de 160ms, perfiles de 180ms; desplazamientos con `cubic-bezier(0.16, 1, 0.3, 1)` y color con `ease-out`. El spinner gira en 900ms. `prefers-reduced-motion: reduce` elimina animaciones y transiciones y restaura scroll automático.

## Shapes

Paneles y orientación de 16px; cursos de 14px; fecha de 12px; botones, campos y enlaces de navegación de 10px. Avatares circulares, indicadores pequeños redondos y barras de progreso de 4px. Bordes de 1px dividen superficies sin añadir sombras.

## Components

### Buttons

Acción principal azul con texto blanco, mínimo 44px, padding 12px 18px y texto 12px/600. Hover azul más profundo; variante secundaria azul clara y variante `dark-button` de 38px dentro del panel azul/violeta claro. Disabled usa opacidad 0.5 y cursor no permitido. Foco visible global de 3px en `accent`, separado 4px. No afirmar que todos los controles alcanzan 44px: existen variantes compactas.

### Cards / Containers

Panel general de 26px de padding, 21px en móvil. Curso enlazable con borde, padding 18px 16px y progreso de evaluaciones publicadas. Los porcentajes y promedios derivan de datos académicos; no sustituir valores ausentes por resultados inventados. La fecha blanca pertenece a la próxima clase; sin próxima clase se muestra un icono y mensaje alternativo.

### Inputs / Fields

Campos claros, borde `input-border`, mínimo 46px y radio 10px. Foco cambia borde a `accent` y mantiene outline. Checkbox de 21px con etiqueta activable de mínimo 44px. Estados de error, aviso y vacío son texto contextual. Los campos conservan 13px incluso en móvil; no se documenta prevención universal del zoom en iOS.

### Navigation

Enlaces con icono y texto; activo vía `aria-current="page"`, fondo navy azulado e indicador cian en el rail. Hover grafito más claro. Menú móvil nativo desplegable, con enlaces en dos columnas. Institución y rol determinan navegación y permisos; conservar el contexto de institución en rutas.

### Agenda

Selector semanal de botones con `aria-pressed`, marcas de días con clases y resultados en región `aria-live="polite"`. Estado vacío explícito para días sin clases. Fechas presentadas en español de Perú y zona America/Lima.

### Demo y autenticación

Tres perfiles locales explícitos: estudiante Lucía Torres, docente Diego Mendoza y administradora Valeria Ríos. Al entrar, todos los perfiles se deshabilitan; el elegido muestra spinner y «Abriendo tu espacio…». Error mediante `role="alert"`. El shell demo muestra «Demo local» y «Datos ficticios · Cambios persistentes», con cambio de perfil. Es un proveedor distinto de Google; los secretos y datos demo permanecen separados. No presentar credenciales Google pendientes ni módulos futuros como disponibles.

## Do's and Don'ts

- **Do** reutilizar los tokens efectivos de reference-theme.css y los tamaños locales antes de añadir variantes.
- **Do** mantener estados vacíos, pendientes, error y contexto de institución.
- **Do** preservar foco, teclado, texto de estados y movimiento reducido. WCAG 2.2 AA es un objetivo, no un resultado certificado por este documento.
- **Don't** restaurar la dirección completamente oscura anterior ni Plus Jakarta Sans.
- **Don't** añadir halos neón, sombras arbitrarias ni imágenes sin procedencia.
- **Don't** confundir datos ficticios persistentes con producción o autenticación Google.

La demo activa utiliza un único grupo Compose propio; el grupo inicial está detenido y sus volúmenes conservados. Esto describe el entorno actual, no un token visual.
El CTA textual naranja de la demo utiliza #ad4d08 sobre blanco para conservar contraste; los iconos mantienen el naranja vivo.
Carruseles: desplazamiento horizontal scroll-snap con flechas e indicadores, interacción táctil nativa y movimiento reducido. Gráfico de barras con datos publicados, filtro por curso y texto de cada evaluación. Búsqueda de cursos/evaluaciones por institución activa. Tipografía de cursos y notas ampliada.
