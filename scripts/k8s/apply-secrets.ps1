param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("dev", "preprod", "prod")]
  [string]$Environment
)

$ErrorActionPreference = "Stop"

$namespaceByEnvironment = @{
  dev = "collector-dev"
  preprod = "collector-preprod"
  prod = "collector-prod"
}

$namespace = $namespaceByEnvironment[$Environment]
$envFile = ".env.k8s.$Environment"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.TrimStart().StartsWith("#")) {
      $parts = $_ -split "=", 2
      if ($parts.Count -ne 2) {
        throw "Invalid line in $envFile: $_"
      }

      [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
    }
  }
}

function Get-Value {
  param(
    [string]$Name,
    [string]$DefaultValue = ""
  )

  $value = [System.Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    $value = [System.Environment]::GetEnvironmentVariable($Name, "User")
  }
  if ([string]::IsNullOrWhiteSpace($value)) {
    $value = [System.Environment]::GetEnvironmentVariable($Name, "Machine")
  }
  if ([string]::IsNullOrWhiteSpace($value)) {
    $value = $DefaultValue
  }

  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required value: $Name. Define it in $envFile or in the environment."
  }

  return $value
}

$postgresDb = Get-Value -Name "POSTGRES_DB" -DefaultValue "collector"
$postgresUser = Get-Value -Name "POSTGRES_USER" -DefaultValue "collector"
$postgresPassword = Get-Value -Name "POSTGRES_PASSWORD"
$jwtSecret = Get-Value -Name "JWT_SECRET"
$internalServiceToken = Get-Value -Name "INTERNAL_SERVICE_TOKEN"
$resendApiKey = Get-Value -Name "RESEND_API_KEY" -DefaultValue "disabled"
$pgDatabase = Get-Value -Name "PGDATABASE" -DefaultValue $postgresDb
$pgUser = Get-Value -Name "PGUSER" -DefaultValue $postgresUser
$pgPassword = Get-Value -Name "PGPASSWORD" -DefaultValue $postgresPassword
$databaseUrl = Get-Value -Name "DATABASE_URL" -DefaultValue "postgresql://$postgresUser:$postgresPassword@postgres:5432/$postgresDb?schema=public"

kubectl create namespace $namespace --dry-run=client -o yaml | kubectl apply -f -

$postgresSecretArgs = @(
  "create", "secret", "generic", "postgres-secrets",
  "--namespace=$namespace",
  "--from-literal=POSTGRES_DB=$postgresDb",
  "--from-literal=POSTGRES_USER=$postgresUser",
  "--from-literal=POSTGRES_PASSWORD=$postgresPassword",
  "--dry-run=client",
  "-o", "yaml"
)

$sharedSecretArgs = @(
  "create", "secret", "generic", "shared-secrets",
  "--namespace=$namespace",
  "--from-literal=DATABASE_URL=$databaseUrl",
  "--from-literal=JWT_SECRET=$jwtSecret",
  "--from-literal=INTERNAL_SERVICE_TOKEN=$internalServiceToken",
  "--from-literal=RESEND_API_KEY=$resendApiKey",
  "--from-literal=PGDATABASE=$pgDatabase",
  "--from-literal=PGUSER=$pgUser",
  "--from-literal=PGPASSWORD=$pgPassword",
  "--dry-run=client",
  "-o", "yaml"
)

(& kubectl @postgresSecretArgs) | kubectl apply -f -
(& kubectl @sharedSecretArgs) | kubectl apply -f -

Write-Host "Secrets applied to namespace $namespace."
