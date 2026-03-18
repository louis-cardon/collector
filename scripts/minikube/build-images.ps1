$ErrorActionPreference = "Stop"

$dockerEnv = (minikube -p minikube docker-env --shell powershell | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($dockerEnv)) {
  throw "Unable to resolve the Minikube Docker environment."
}

Invoke-Expression $dockerEnv

$images = @(
  @{ Name = "collector/api-gateway:latest"; Dockerfile = "services/api-gateway/Dockerfile" },
  @{ Name = "collector/auth-service:latest"; Dockerfile = "services/auth-service/Dockerfile" },
  @{ Name = "collector/catalog-service:latest"; Dockerfile = "services/catalog-service/Dockerfile" },
  @{ Name = "collector/article-service:latest"; Dockerfile = "services/article-service/Dockerfile" },
  @{ Name = "collector/audit-service:latest"; Dockerfile = "services/audit-service/Dockerfile" },
  @{ Name = "collector/notification-service:latest"; Dockerfile = "services/notification-service/Dockerfile" },
  @{ Name = "collector/frontend:latest"; Dockerfile = "frontend/Dockerfile" }
)

foreach ($image in $images) {
  Write-Host "Building $($image.Name) in Minikube..."
  docker build -f $image.Dockerfile -t $image.Name .
}
