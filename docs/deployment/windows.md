# Desarrollo en Windows
Requisitos inspeccionados: Node 22.20.0, pnpm 11.3.0, Docker Desktop 29.8.0 con motor operativo, Git 2.51.0 y VS Code. Disco D disponible.
Desde PowerShell:
```powershell
cd D:\educontrol360
code .
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
pnpm dev
```
Si PowerShell tiene política de scripts restrictiva, usar pnpm.cmd en los comandos manuales. Docker requiere virtualización y motor Linux/WSL2 configurados. No instalar PostgreSQL ni Redis en Windows.
Web: http://localhost:3000/login. API: http://localhost:4000. OpenAPI local: http://localhost:4000/docs. Readiness: /health/ready; liveness: /health/live.
## Comprobaciones
```powershell
pnpm verify
pnpm test:e2e
docker compose ps
```
Las pruebas integran PostgreSQL real. Las de navegador requieren Chromium instalado por Playwright o Chrome/Edge; consultar tests/e2e. El script E2E no reemplaza la prueba con Google.
## Todo en Docker
Detener primero servidores locales que ocupen 3000 y 4000.
```powershell
docker compose -f docker-compose.yml -f docker-compose.app.yml build
docker compose -f docker-compose.yml -f docker-compose.app.yml run --rm api pnpm db:migrate
docker compose -f docker-compose.yml -f docker-compose.app.yml up -d --wait
```
Primero deben estar saludables PostgreSQL y Redis: pnpm infra:up.
Para hot reload, añadir -f docker-compose.dev.yml a build/up. Los archivos fuente de D se montan en los contenedores; node_modules permanece en Linux. Las imágenes usan usuario node sin privilegios y Dockerfiles multi-stage.
Detener sin borrar datos: docker compose -f docker-compose.yml -f docker-compose.app.yml down. Nunca usar down -v salvo que se desee eliminar la base local.
## Backups
```powershell
New-Item -ItemType Directory -Force D:\educontrol360\work\backups
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/educontrol.dump'
docker compose cp postgres:/tmp/educontrol.dump D:\educontrol360\work\backups\educontrol.dump
```
No versionar backups. Comprobar restauración en una base separada antes de confiar en un respaldo. No se implementó aún un plan administrado de backups ni staging.
