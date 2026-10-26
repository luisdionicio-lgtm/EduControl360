# Arquitectura y límites actuales
## Monorepo
pnpm workspaces, sin Turborepo: cuatro paquetes no requieren otra capa de orquestación. Next.js 16.4.3, NestJS 12.2.0, Prisma 7.10.1 (estable frente a 8 RC), PostgreSQL 17 y Redis 7. Lockfile versionado. Node 22.20 local; imágenes Node 22 LTS. Windows es el entorno principal, web adaptable a dispositivos.
## Identidad y autorización
Auth.js mediante next-auth 4.24.15 estable (compatible con Next 16 / React 19 según peerDependencies), frente a v5 todavía beta en la inspección. Google OIDC con PKCE, state y nonce; validación de tokens delegada al proveedor oficial de Auth.js/OpenID Client. Se exige email_verified y se usa sub estable. No se fusionan cuentas por coincidencia de correo.
El JWT cifrado de Auth.js contiene userId y sessionId. La sesión persistida expira a las 8 horas y puede revocarse. Next.js actúa como backend de la web: comprueba la sesión y emite un JWT HS256 de 60 segundos exclusivamente para NestJS (issuer, audience y algoritmo fijados). El navegador nunca recibe ese bearer ni el secreto compartido. Nest valida además la sesión y el usuario en PostgreSQL en cada petición.
Las cookies de Auth.js usan HttpOnly, SameSite y Secure bajo HTTPS de producción. La API no confía en roles del JWT: consulta membresías activas y comprueba tenant y recursos. El proxy de mutaciones exige Origin del mismo sitio. La API local escucha en loopback; Docker solo publica en loopback.
## Instituciones
Crear una institución nueva concede propiedad explícita a quien la crea. Esto no verifica el nombre legal, dominio ni una institución existente. La verificación legal y la aprobación comercial quedan pendientes.
El desafío DNS TXT comprueba control de un dominio. No concede acceso a estudiantes. Las invitaciones exigen dominio verificado; se almacenan con hash SHA-256, vencen en 7 días y se consumen una vez de forma atómica, con correo Google coincidente. Una invitación no sobrescribe un rol ya existente ni reactiva una membresía suspendida.
## Académico
Programas, cursos, períodos, secciones, estudiantes, matrícula, docente, evaluación, nota, asistencia y horario. Estudiante vinculado por invitación aceptada o membresía previa. Docentes limitados a secciones asignadas. Solo notas publicadas viajan al portal estudiante. Escala inicial 0–20; pesos sumados no mayores de 100 %, serializados con bloqueo de fila por sección.
No hay promedio final mientras no se defina una política institucional y el tratamiento de evaluaciones pendientes.
Matrícula, publicación de nota y creación institucional generan auditoría en la misma transacción. No se implementó aún auditoría completa de cada cambio.
## Defensa pendiente
Aislamiento por filtros del servidor y pruebas, sin RLS aún. Se necesitan políticas de retención, MFA privilegiado, rate limiting distribuido, rotación de claves, auditoría completa, pruebas de carga y revisión de seguridad antes de producción. Redis se verifica como servicio; no se afirma que ya existan colas.
