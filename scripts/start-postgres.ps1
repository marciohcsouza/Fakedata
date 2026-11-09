$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
& "$projectRoot/work/postgres/runtime/pgsql/bin/pg_ctl.exe" -D "$projectRoot/work/postgres/data" -l "$projectRoot/work/postgres/server.log" -w start
if ($LASTEXITCODE) { throw 'Não foi possível iniciar o PostgreSQL. Consulte work/postgres/server.log.' }
