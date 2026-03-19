$ErrorActionPreference = "Stop"

kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
& (Join-Path $PSScriptRoot "patch-repo-server.ps1")
