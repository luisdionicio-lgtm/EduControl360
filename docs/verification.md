# Verificación de la entrega inicial
Fecha de trabajo: 26 de octubre de 2026 (America/Lima). Entorno Windows, D:\\educontrol360.
## Resultados reales
| Comprobación | Resultado |
| --- | --- |
| Node / pnpm / Git / Docker / VS Code | Inspeccionados antes de instalar; disponibles |
| Docker Desktop / motor | Responde; PostgreSQL y Redis levantados |
| pnpm install --frozen-lockfile | Instalación reproducible completada |
| Prisma generate | Cliente 7.10.1 generado |
| Prisma migrate deploy | Tres migraciones aplicadas a PostgreSQL real |
| TypeScript estricto | Sin errores en database, API y web |
| pnpm test | 10 pruebas pasan, 0 fallos, 0 omitidas |
| pnpm build | NestJS y Next.js compilados correctamente |
| pnpm verify | Generación, tipos, integración y build correctos |
| pnpm format:check | Formato correcto |
| pnpm test:e2e | Servidores aislados 4100/4101; prueba de navegador correcta |
| Browser E2E contra Docker | Correcta contra web/API en 3000/4000 |
| Docker build | Imágenes web y API construidas con dependencias Linux |
| Compose app y dev | Configuración validada |
| Compose up --wait | Cuatro servicios saludables |
| GET /health/ready | status ready, PostgreSQL y Redis up |
| GET /login | HTTP 200 |
| Revisión visual | Escritorio 1440px y móvil 390px; fundamento revisado y correcciones resueltas |
## Escenarios de integración
Sesión ausente, falsa, expirada y audience incorrecto; aislamiento entre instituciones; estudiante sin permiso de escritura; programa/curso/período/sección; asignación docente; matrícula única; DTO con propiedad extra; evaluación y pesos concurrentes; nota borrador oculta; nota publicada visible únicamente al estudiante matriculado; auditoría; asistencia y horario; invitación ligada al correo, de un solo uso; dominio sin verificación rechazado; suspensión de membresía y revocación de sesión inmediatas.
## Escenarios de navegador
Portal y rutas de cursos/notas/asistencia/horario/cuenta; restricción de gestión para estudiante; rechazo CSRF por origen; creación de programa por administrador; publicación de nota y consulta desde cuenta estudiante; cierre de sesión con revocación persistida; redirección de anónimo; sesión revocada sin bucle de redirección.
## Evidencia visual
Las capturas en screenshots/ contienen exclusivamente datos de prueba ficticios. No demuestran Google OAuth real. Los fixtures se eliminan al terminar.
## Límites
Google real, DNS institucional real, APIs Workspace/Gemini y módulos comerciales no se verificaron ni se declaran terminados. El usuario indicó que no dispone de credenciales Google y autorizó dejarlas pendientes. No hubo despliegue público ni pagos. La ejecución de GitHub Actions se comprueba por separado después de subir código; las pruebas anteriores se ejecutaron localmente.
