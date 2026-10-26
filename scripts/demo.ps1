$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot)
if (!(Test-Path .env.demo)) {
  $demoValues = & node -e "const c=require('crypto');for(const k of ['DEMO_DB_PASSWORD','DEMO_AUTH_SECRET','DEMO_API_SECRET'])console.log(k+'='+c.randomBytes(32).toString('hex'))"
  [IO.File]::WriteAllLines((Join-Path (Get-Location) '.env.demo'), $demoValues)
}
function Run-Demo([string[]]$Arguments) {
  & docker compose --env-file .env.demo -f docker-compose.demo.yml @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Demo command failed: $LASTEXITCODE" }
}
Run-Demo -Arguments @('build')
Run-Demo -Arguments @('up','-d','--wait','postgres','redis')
Run-Demo -Arguments @('run','--rm','--no-deps','api','pnpm','db:migrate')
Run-Demo -Arguments @('run','--rm','--no-deps','api','node','scripts/seed-demo.cjs')
Run-Demo -Arguments @('up','-d','--wait')
Write-Host "Demo disponible: http://localhost:3010/demo"
