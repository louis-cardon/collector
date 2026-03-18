param(
  [int]$GrafanaPort = 3007,
  [int]$PostgresPort = 55432,
  [string]$Namespace = "collector-dev-local",
  [string]$ServiceName = "postgres",
  [string]$ContainerName = "collector-grafana-local"
)

$ErrorActionPreference = "Stop"

function Test-PortListening {
  param([int]$Port)

  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $iar.AsyncWaitHandle.WaitOne(500)
    if ($connected -and $client.Connected) {
      $client.EndConnect($iar)
      $client.Close()
      return $true
    }

    $client.Close()
    return $false
  } catch {
    return $false
  }
}

function Get-FreePort {
  param([int]$StartingPort)

  $port = $StartingPort
  while (Test-PortListening -Port $port) {
    $port++
  }

  return $port
}

function Wait-ForHttpOk {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod -Uri $Url -TimeoutSec 5
      if ($response.database -eq "ok") {
        return
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  throw "Timed out waiting for Grafana health endpoint at $Url"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tmpDir = Join-Path $repoRoot "tmp"
$provisioningDir = Join-Path $repoRoot "infra\compose\grafana-local\provisioning"
$dashboardsDir = Join-Path $repoRoot "infra\compose\grafana-local\dashboards"
$stateFile = Join-Path $tmpDir "grafana-local-state.json"
$logSuffix = Get-Date -Format "yyyyMMdd-HHmmss"
$portForwardStdoutLog = Join-Path $tmpDir "grafana-postgres-port-forward-$logSuffix.out.log"
$portForwardStderrLog = Join-Path $tmpDir "grafana-postgres-port-forward-$logSuffix.err.log"

New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

kubectl get svc $ServiceName -n $Namespace | Out-Null

$PostgresPort = Get-FreePort -StartingPort $PostgresPort

$state = $null
if (Test-Path $stateFile) {
  try {
    $state = Get-Content $stateFile | ConvertFrom-Json
  } catch {
    $state = $null
  }
}

$portForwardRunning = $false
if ($state -and $state.portForwardPid) {
  try {
    $process = Get-Process -Id $state.portForwardPid -ErrorAction Stop
    if (-not $process.HasExited -and (Test-PortListening -Port $PostgresPort)) {
      $portForwardRunning = $true
    }
  } catch {
    $portForwardRunning = $false
  }
}

if (-not $portForwardRunning) {
  $portForwardProcess = Start-Process `
    -FilePath "kubectl" `
    -ArgumentList @("port-forward", "-n", $Namespace, "svc/$ServiceName", "${PostgresPort}:5432") `
    -RedirectStandardOutput $portForwardStdoutLog `
    -RedirectStandardError $portForwardStderrLog `
    -PassThru `
    -WindowStyle Hidden

  $deadline = (Get-Date).AddSeconds(20)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListening -Port $PostgresPort) {
      break
    }

    Start-Sleep -Seconds 1
  }

  if (-not (Test-PortListening -Port $PostgresPort)) {
    throw "Postgres port-forward did not start on port $PostgresPort. Check $portForwardStdoutLog and $portForwardStderrLog"
  }
} else {
  $portForwardProcess = Get-Process -Id $state.portForwardPid
}

$existingContainerId = docker ps -a --filter "name=^/${ContainerName}$" --format "{{.ID}}"
if ($existingContainerId) {
  docker rm -f $ContainerName | Out-Null
}

$dockerArgs = @(
  "run", "-d",
  "--name", $ContainerName,
  "--add-host", "host.docker.internal:host-gateway",
  "-p", "${GrafanaPort}:3000",
  "-e", "GF_SECURITY_ADMIN_USER=admin",
  "-e", "GF_SECURITY_ADMIN_PASSWORD=admin",
  "-e", "GF_USERS_ALLOW_SIGN_UP=false",
  "-e", "GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/collector-audit.json",
  "-e", "GRAFANA_AUDIT_DB_HOST=host.docker.internal:${PostgresPort}",
  "-e", "GRAFANA_AUDIT_DB_NAME=collector",
  "-e", "GRAFANA_AUDIT_DB_USER=collector",
  "-e", "GRAFANA_AUDIT_DB_PASSWORD=collector",
  "-v", "${provisioningDir}:/etc/grafana/provisioning:ro",
  "-v", "${dashboardsDir}:/var/lib/grafana/dashboards:ro",
  "grafana/grafana:11.5.2"
)

$containerId = (& docker @dockerArgs).Trim()
if ([string]::IsNullOrWhiteSpace($containerId)) {
  throw "Failed to start Grafana container."
}

@{
  grafanaPort = $GrafanaPort
  postgresPort = $PostgresPort
  portForwardPid = $portForwardProcess.Id
  containerName = $ContainerName
} | ConvertTo-Json | Set-Content -Path $stateFile

Wait-ForHttpOk -Url "http://127.0.0.1:${GrafanaPort}/api/health"

Write-Host "Grafana local is ready on http://localhost:${GrafanaPort}"
Write-Host "Login: admin / admin"
Write-Host "Datasource: Audit PostgreSQL"
Write-Host "Dashboard: Collector Audit Local"
Write-Host "Direct dashboard: http://localhost:${GrafanaPort}/d/collector-audit-local/collector-audit-local"
