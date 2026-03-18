$ErrorActionPreference = "Stop"

kubectl apply -f infra/argocd/project.yaml
kubectl apply -f infra/argocd/apps/collector-dev-local.yaml
