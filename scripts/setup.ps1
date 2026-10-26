$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot)
if (!(Test-Path .env)) {
  $values = Get-Content .env.example -Raw
  $dbSecret = & node -e "process.stdout.write(require('crypto').randomBytes(20).toString('hex'))"
  $authSecret = & node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
  $apiSecret = & node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
  $values = $values.Replace('replace-with-local-password',$dbSecret).Replace('generate-a-random-secret',$authSecret).Replace('generate-another-random-secret',$apiSecret)
  [IO.File]::WriteAllText((Join-Path (Get-Location) '.env'),$values)
}
foreach ($line in Get-Content .env) {
  if ($line -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1],$matches[2],'Process') }
}
function Run-Checked([scriptblock]$Command) {
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE" }
}
Run-Checked { pnpm install --frozen-lockfile }
Run-Checked { docker compose up -d --wait postgres redis }
Run-Checked { pnpm db:generate }
Run-Checked { pnpm db:migrate }
Run-Checked { pnpm --filter @edu/database build }
Copy-Item .env apps/web/.env.local
Write-Host "Listo. Ejecuta pnpm dev y abre http://localhost:3000/login"
