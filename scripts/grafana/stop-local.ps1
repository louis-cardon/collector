param(
  [string]$ContainerName = "collector-grafana-local"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$stateFile = Join-Path $repoRoot "tmp\grafana-local-state.json"

$existingContainerId = docker ps -a --filter "name=^/${ContainerName}$" --format "{{.ID}}"
if ($existingContainerId) {
  docker rm -f $ContainerName | Out-Null
}

if (Test-Path $stateFile) {
  try {
    $state = Get-Content $stateFile | ConvertFrom-Json
    if ($state.portForwardPid) {
      try {
        Stop-Process -Id $state.portForwardPid -Force -ErrorAction Stop
      } catch {
      }
    }
  } finally {
    Remove-Item $stateFile -Force
  }
}

Write-Host "Grafana local stopped."
