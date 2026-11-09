param([int]$Port = 4310)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  Write-Host "Install Node.js 24 LTS from https://nodejs.org, then reopen this file." -ForegroundColor Yellow
  exit 1
}
$major = [int]((& $nodeCommand.Source -p "process.versions.node.split('.')[0]") | Select-Object -Last 1)
if ($major -lt 24) { Write-Host "Node.js 24 or newer is required." -ForegroundColor Yellow; exit 1 }
if ($Port -lt 1024 -or $Port -gt 65535) { Write-Host "Choose a port between 1024 and 65535."; exit 1 }
$env:PORT = [string]$Port
Write-Host ""
Write-Host "ROWAIHY CONNECT - Local Project Test Hub" -ForegroundColor Green
Write-Host "Open http://127.0.0.1:$Port after the Ready line appears."
Write-Host "Keep this window open. Press Ctrl+C to stop."
Write-Host "No administrator rights, Docker, or API subscription required."
Write-Host ""
& $nodeCommand.Source (Join-Path $PSScriptRoot "src\server.mjs")
exit $LASTEXITCODE
