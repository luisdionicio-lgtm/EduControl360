# API REST inicial
NestJS en http://localhost:4000, documentación OpenAPI local en /docs (desactivada con NODE_ENV=production).
El navegador usa /api/backend en Next.js. NestJS requiere un bearer interno, sesión persistida activa y membresía institucional; no se admite tenant desde un token como autorización suficiente.
## Endpoints
- GET /health/live, GET /health/ready: liveness y comprobación real PostgreSQL/Redis.
- GET /me: identidad y membresías activas.
- POST /institutions: institución y propietario explícito.
- POST /invitations/accept: invitación de un solo uso y correo coincidente.
- GET /institutions/:id/student: cursos, notas publicadas, asistencia y horarios propios.
- GET /institutions/:id/academic: gestión para administrador o docente asignado.
- GET /institutions/:id/settings: configuración institucional (ADMIN).
- POST /institutions/:id/domains: desafío DNS TXT (ADMIN).
- POST /institutions/:id/domains/:domainId/verify: verificación real DNS (ADMIN).
- POST /institutions/:id/invitations: crear invitación (ADMIN y dominio verificado).
- POST /institutions/:id/programs, /courses, /periods, /sections, /students, /enrollments: estructura y matrícula (ADMIN).
- POST /institutions/:id/sections/:sectionId/teacher: docente activo de la institución (ADMIN).
- POST /institutions/:id/evaluations, /grades, /attendance: ADMIN o docente asignado.
- POST /institutions/:id/schedules: horario (ADMIN).
- GET /institutions/:id/audit: últimos 100 eventos transaccionales (ADMIN).
## Errores
400: DTO o regla académica inválida; 401: sesión inválida; 403: sin membresía o permiso; 404: recurso inexistente; 409: restricción de unicidad; 503: infraestructura no disponible.
Los DTO rechazan propiedades extra. Las notas van de 0 a 20 y los pesos de las evaluaciones no pueden superar 100 %. Fechas de asistencia son días calendario; las publicaciones se muestran en America/Lima.
