# Portal estudiante

Modo Operate. Dirección confirmada: **Cuaderno académico**, navy/índigo y Geist Variable / Plus Jakarta Sans Variable. Aplicación web responsive desarrollada en Windows. Prioridad: consultar cursos y notas publicadas desde teléfono o laptop.

## Superficie implementada

El shell mantiene marca, institución seleccionada cuando existe membresía coincidente, navegación y nombre/rol del usuario. Los enlaces Inicio, Mis cursos, Mis notas, Asistencia, Horario y Mi cuenta conservan la institución en la URL. Gestión académica aparece para membresías distintas de STUDENT. Si hay varias membresías, un formulario permite elegir institución y enviar el cambio.

Inicio reúne cursos y calificaciones publicadas. Cursos muestra código, sección/período, créditos y evaluaciones publicadas respecto del total. Notas muestra evaluación/curso, peso, nota sobre 20 con dos decimales y fecha de publicación en es-PE/America/Lima. Asistencia y horario tienen registros propios; el horario se ordena por día y hora. Mi cuenta presenta identidad, correo e instituciones vinculadas. Sin institución se muestra onboarding; sin estudiante o matrícula, un mensaje orienta a contactar con administración.

## Escritorio y móvil

El rail mide 244px; hasta 1000px pasa a 210px. El contenido usa 48px laterales, reducidos a 28px en ese breakpoint. Hasta 700px el rail se coloca arriba, sus enlaces forman una fila desplazable horizontalmente y el contenido usa 20px laterales. El encabezado del usuario permanece en el área principal. El pie del rail se oculta; la institución permanece visible si existe.

Las tablas tienen regiones nombradas enfocables por teclado. En escritorio son tablas de ancho completo con posible overflow horizontal. Hasta 700px pasan a filas apiladas en dos columnas; la primera celda ocupa toda la fila. Los encabezados quedan visualmente ocultos y cada celda muestra una etiqueta mediante data-label. El contenedor móvil deja de desplazar horizontalmente y el texto largo puede partirse.

## Estados y semántica

La ruta activa se identifica mediante aria-current="page" en enlaces. La gestión usa botones aria-pressed dentro de navegación con nombre, no un patrón ARIA tablist. El foco global es un contorno índigo de 3px separado 4px. Hay un enlace para saltar al contenido. La raíz declara idioma español.

La carga del campus anuncia «Cargando tu espacio académico…» con role="status". Existen vacíos específicos para matrícula, notas, asistencia y horario. La gestión anuncia errores con role="alert" y resultados con role="status"; bloquea formularios durante el guardado o cuando faltan opciones previas. Los estados conservan texto además del color. El checkbox visible mide 22px y se coloca junto a una etiqueta asociada activable de al menos 44px de alto, dentro de una rejilla de 22px y una columna flexible. Botones, enlaces del rail, inputs y selects tienen mínimo 44px de alto. El botón secundario conserva texto índigo oscuro al cambiar a un fondo índigo claro más intenso en hover.

El movimiento implementado se limita al fondo de botones durante 160ms ease-out. Movimiento reducido elimina transiciones, animaciones y desplazamiento animado. No se afirma conformidad WCAG auditada ni se documentan como implementadas pantallas de error/prohibición que no se han verificado en estos componentes.

## Firma y límites

La firma es el registro académico legible: superficies claras, divisores, cifras tabulares y estado de publicación explícito, enmarcados por navegación navy. DESIGN.md y su frontmatter describen los tokens reales. Este documento describe composición y comportamiento del portal; no acredita la configuración de credenciales Google, la autorización del backend ni pruebas de accesibilidad completas.
