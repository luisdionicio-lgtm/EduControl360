# Estado real — 26 de octubre de 2026
El prompt completo sigue siendo la hoja de ruta. Esta entrega NO equivale a sus siete fases completadas.
## Implementado y probado
- Monorepo pnpm en D, abierto en VS Code, Windows; Node/pnpm/Docker/Git inspeccionados antes de instalar.
- Next.js / React / TypeScript estricto; NestJS REST; Prisma / PostgreSQL real; Redis con health check.
- Migraciones versionadas y restricciones para notas, créditos, pesos, fechas y horarios.
- Membresía por institución, tres roles iniciales (ADMIN, TEACHER, STUDENT), comprobación de recursos y contexto en backend.
- Sesiones persistidas revocables; tokens internos con issuer/audience/algoritmo y caducidad.
- Institución, desafío DNS, invitación de un solo uso y aceptación con correo coincidente.
- Programa, curso, período, sección, asignación de docente y matrícula.
- Evaluación, nota borrador/publicada, asistencia manual y horario.
- Portal estudiante: cursos, notas publicadas, asistencia, horario, cuenta y selector institucional.
- Gestión institucional/docente con formularios conectados a la API.
- Diseño Cuaderno académico confirmado; responsive escritorio/móvil; tablas apiladas con etiquetas, estados vacíos, carga/error, foco y movimiento reducido.
- Pruebas de integración con PostgreSQL y Redis reales. Pruebas de navegador con identidades de fixture explícitas, sin endpoint de login simulado.
- Dockerfiles multi-stage y configuración Compose; CI inicial versionado. La ejecución remota de CI depende de la subida al repositorio.
## Implementado pendiente de verificación externa
- Google OIDC con Auth.js: firma, issuer/audience/caducidad delegados al proveedor; email verificado y sub estable. El usuario confirmó que no dispone de credenciales y autorizó dejarlo pendiente. No se ha ejecutado el login Google real.
- DNS TXT institucional: comprobador real implementado; probado el rechazo de registros inexistentes. No se verificó un dominio real del propietario.
## Simulado únicamente en pruebas
- Identidades Google: fixtures con sub imposible de Google y sesiones generadas por pruebas.
- Cookie Auth.js cifrada para iniciar escenarios de navegador. Solo el script de prueba conoce el secreto local; no existe acceso de demostración en la aplicación.
- Dominio verificado dentro de un fixture de integración para probar invitaciones; nunca un endpoint público para omitir DNS.
Los fixtures se eliminan al terminar.
## Pendiente por fases
| Fase | Estado y alcance pendiente |
| --- | --- |
| 1 | Fundamentos verificados. Ampliar observabilidad, caché/colas y rendimiento. No se añadió Turborepo por complejidad innecesaria actual. |
| 2 | Identidad/membresías iniciales. Falta verificación real Google/DNS, catálogo/sugerencias de dominios, roles granulares completos, MFA y administración de sesiones. |
| 3 | Primer núcleo conectado probado. Faltan mallas, facultades, sedes, prerrequisitos, créditos acumulados, escalas configurables, actas, QR y justificaciones. |
| 4 | Portal estudiante y gestión iniciales. Faltan comunicaciones, materiales S3, tareas/entregas, reportes/exportaciones, portal familiar con autorización legal y centro de cuentas completo. |
| 5 | Classroom, Calendar, Drive, Meet y sincronización pendientes; requieren proyecto Google, scopes y consentimiento. No hay botones que finjan sincronizar. |
| 6 | Suscripciones, finanzas, pagos/conciliación reales, soporte, dominios personalizados, verificación legal, despliegue y controles comerciales pendientes. |
| 7 | Gemini, analítica avanzada, automatizaciones y optimización pendientes. |
## Puerta de avance
El primer flujo obligatorio no se declara cerrado hasta validar Google y DNS con accesos reales. No activar cobros, importar datos personales reales ni anunciar producción con este estado. El siguiente trabajo debe cerrar identidad real antes de ampliar los módulos, conforme al orden del prompt.

## Actualización: Campus Atelier y demo local
El usuario eligió interfaz principalmente oscura. Se reemplazó Cuaderno académico por Campus Atelier: grafito, violeta y lima, títulos Sora y lectura Geist. Dashboard con agenda semanal, cursos, notas y promedios parciales calculados. Demo Docker aislada con perfiles explícitos estudiante/docente/administrador, PostgreSQL propio y cookies separadas. Pruebas de navegador verificaron publicación/consulta de nota y creación de programa. Google real y fases posteriores continúan pendientes. Consultar docs/demo.md.
Referencia visual posterior del usuario: interior claro azulado con rail navy y acentos eléctricos; implementada en reference-theme.css. Se detuvo y eliminó el grupo Compose inicial sin borrar volúmenes; solo queda el grupo demo.
Se añadieron carrusel funcional de cursos, búsqueda de cursos/evaluaciones y gráfico de notas con filtro. Estas funciones consumen datos reales del núcleo académico.
