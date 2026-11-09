$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
& "$projectRoot/work/postgres/runtime/pgsql/bin/pg_ctl.exe" -D "$projectRoot/work/postgres/data" -m fast -w stop
if ($LASTEXITCODE) { throw 'Não foi possível parar o PostgreSQL.' }
