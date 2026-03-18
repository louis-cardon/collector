param(
  [switch]$KeepMinikube
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tmpDir = Join-Path $repoRoot "tmp"
$stateFile = Join-Path $tmpDir "demo-local-state.json"

try {
  & (Join-Path $repoRoot "scripts\grafana\stop-local.ps1")
} catch {
}

$portForwardProcesses = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "kubectl.exe" -and
    $_.CommandLine -match "port-forward" -and (
      $_.CommandLine -match "svc/ingress-nginx-controller 8088:80" -or
      $_.CommandLine -match "svc/argocd-server 8080:443" -or
      $_.CommandLine -match "collector-dev-local" -and $_.CommandLine -match "svc/postgres"
    )
  }

foreach ($processInfo in $portForwardProcesses) {
  try {
    Stop-Process -Id $processInfo.ProcessId -Force -ErrorAction Stop
  } catch {
  }
}

if (Test-Path $stateFile) {
  Remove-Item $stateFile -Force
}

if (-not $KeepMinikube) {
  try {
    minikube stop | Out-Null
  } catch {
  }
}

Write-Host "Demo local stopped."
if ($KeepMinikube) {
  Write-Host "Minikube left running."
}
