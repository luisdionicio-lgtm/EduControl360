# Revisión de seguridad inicial
## Verificado en esta entrega
- Secretos locales generados aleatoriamente, .env excluido de Git y del contexto Docker.
- Tokens de Google manejados por Auth.js; scopes de identidad mínimos, PKCE/state/nonce y email_verified.
- API bearer interno emitido solo en servidor: HS256, 60 segundos, issuer y audience fijos.
- Sesión y usuario activos consultados en PostgreSQL por cada petición protegida.
- Membresía/rol y recursos por tenant comprobados en backend. Docente limitado a secciones asignadas.
- Solo notas publicadas para el propio estudiante.
- Rechazo de mass assignment mediante DTO whitelist/forbidNonWhitelisted.
- Mutaciones web con comprobación de Origin; API sin CORS permisivo.
- Invitación con token hash, correo coincidente, consumo atómico, expiración y sin sobrescritura silenciosa de roles.
- Auditoría transaccional de matrícula y publicación de notas.
- Contraseñas de base y secretos nunca en .env.example.
## Pendiente antes de producción
- Validar Google real, cookies HTTPS y escenarios reales de sesión/expiración.
- MFA obligatorio privilegiado, RBAC/ABAC granular, flujo de recuperación y gestión completa de sesiones.
- Rotación de claves, gestor de secretos, rate limiting distribuido y protección de abuso.
- Evaluación RLS, integridad compuesta de tenant en todas las relaciones, pruebas concurrentes de cambios de permisos.
- Políticas de privacidad/retención, consentimiento, representación familiar y revisión jurídica de datos educativos.
- Auditoría completa de cambios e invitaciones, alertas y monitoreo centralizado.
- Análisis de dependencias continuo, revisión independiente de seguridad, pruebas de carga y recuperación de backups.
- Endurecer imágenes: runtime mínimo sin herramientas de desarrollo, digest actualizado, escaneo y ciclo de parches.
- TLS, reverse proxy, CSP, límites de carga, healthchecks operativos y secretos separados por entorno.
No es una certificación de seguridad ni una aprobación para producción.
