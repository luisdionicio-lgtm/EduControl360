# EduControl 360
Plataforma educativa web multiinstitucional. Desarrollo principal en Windows, almacenado en D:\\educontrol360. Portal estudiante como prioridad confirmada.
## Inicio
```powershell
cd D:\educontrol360
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
pnpm dev
```
Abrir [portal](http://localhost:3000/login). Leer [guía Windows](docs/deployment/windows.md) y [Google Cloud](docs/security/google-cloud.md).
## Estructura
- apps/web: Next.js App Router, Auth.js, proxy seguro y portales responsive.
- apps/api: NestJS, guards, DTO, permisos y lógica académica.
- packages/database: Prisma, PostgreSQL y migraciones.
- infrastructure/docker: imágenes multi-stage.
- tests/e2e y apps/api/test: pruebas reales con fixtures aislados.
- docs: arquitectura, seguridad, usuario y estado por fases.
## Verificación
```powershell
pnpm verify
pnpm test:e2e
```
Requiere PostgreSQL y Redis levantados. [Arquitectura](docs/architecture/decisions.md). [Estado y pendientes](docs/STATUS.md).
## Alcance
Fundamentos y primer núcleo académico implementados. Google OIDC implementado y pendiente de verificación con credenciales del propietario. No se presenta como un SaaS comercial terminado ni listo para producción. Fases posteriores permanecen registradas en STATUS.md; el primer flujo no se considera cerrado hasta probar Google y DNS con accesos reales.

## Demo Campus Atelier
Interfaz principalmente oscura con Sora y Geist. Ejecutar `pnpm demo` y abrir http://localhost:3010/demo. [Guía y recorrido](docs/demo.md).
