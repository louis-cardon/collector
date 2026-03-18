param(
  [int]$AppPort = 8088,
  [int]$GrafanaPort = 3007,
  [string]$IngressNamespace = "ingress-nginx",
  [string]$IngressService = "ingress-nginx-controller",
  [string]$CollectorNamespace = "collector-dev-local"
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

function Wait-ForPort {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListening -Port $Port) {
      return
    }

    Start-Sleep -Seconds 1
  }

  throw "Timed out waiting for local port $Port."
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  throw "Timed out waiting for $Url"
}

function Start-PortForward {
  param(
    [string]$Namespace,
    [string]$Target,
    [string]$LocalPortMapping,
    [string]$StdoutLog,
    [string]$StderrLog
  )

  if (Test-Path $StdoutLog) {
    Remove-Item $StdoutLog -Force
  }

  if (Test-Path $StderrLog) {
    Remove-Item $StderrLog -Force
  }

  $process = Start-Process `
    -FilePath "kubectl" `
    -ArgumentList @("port-forward", "-n", $Namespace, $Target, $LocalPortMapping) `
    -RedirectStandardOutput $StdoutLog `
    -RedirectStandardError $StderrLog `
    -PassThru `
    -WindowStyle Hidden

  $localPort = [int]($LocalPortMapping.Split(":")[0])
  Wait-ForPort -Port $localPort
  return $process
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tmpDir = Join-Path $repoRoot "tmp"
$stateFile = Join-Path $tmpDir "demo-local-state.json"
$ingressStdoutLog = Join-Path $tmpDir "demo-ingress-port-forward.out.log"
$ingressStderrLog = Join-Path $tmpDir "demo-ingress-port-forward.err.log"

New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

$minikubeRunning = $false
try {
  $minikubeStatus = minikube status --format "{{.Host}}" 2>$null
  if ($minikubeStatus -match "Running") {
    $minikubeRunning = $true
  }
} catch {
  $minikubeRunning = $false
}

if (-not $minikubeRunning) {
  minikube start | Out-Null
}

minikube addons enable ingress | Out-Null

$argocdNamespaceExists = $false
try {
  kubectl get namespace argocd | Out-Null
  $argocdNamespaceExists = $true
} catch {
  $argocdNamespaceExists = $false
}

if (-not $argocdNamespaceExists) {
  & (Join-Path $repoRoot "scripts\argocd\install.ps1")
}

kubectl rollout status deployment/argocd-server -n argocd --timeout=180s | Out-Null
& (Join-Path $repoRoot "scripts\argocd\bootstrap-dev-local.ps1")
kubectl annotate application collector-dev-local -n argocd argocd.argoproj.io/refresh=hard --overwrite | Out-Null

kubectl wait --for=condition=available deployment --all -n $CollectorNamespace --timeout=300s | Out-Null

$existingIngressProcess = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "kubectl.exe" -and
    $_.CommandLine -match "port-forward" -and
    $_.CommandLine -match $IngressNamespace -and
    $_.CommandLine -match $IngressService -and
    $_.CommandLine -match "${AppPort}:80"
  } |
  Select-Object -First 1

if ($existingIngressProcess) {
  $ingressProcess = Get-Process -Id $existingIngressProcess.ProcessId -ErrorAction Stop
} else {
  $ingressProcess = Start-PortForward `
    -Namespace $IngressNamespace `
    -Target "svc/$IngressService" `
    -LocalPortMapping "${AppPort}:80" `
    -StdoutLog $ingressStdoutLog `
    -StderrLog $ingressStderrLog
}

& (Join-Path $repoRoot "scripts\grafana\start-local.ps1") -GrafanaPort $GrafanaPort

@{
  appPort = $AppPort
  grafanaPort = $GrafanaPort
  ingressPortForwardPid = $ingressProcess.Id
} | ConvertTo-Json | Set-Content -Path $stateFile

Wait-ForHttp -Url "http://localhost:${AppPort}"
Wait-ForHttp -Url "http://localhost:${AppPort}/docs"

Write-Host "Demo local ready."
Write-Host "App: http://localhost:${AppPort}"
Write-Host "Swagger: http://localhost:${AppPort}/docs"
Write-Host "Grafana: http://localhost:${GrafanaPort}/d/collector-audit-local/collector-audit-local"
