#!/usr/bin/env bash

set -euo pipefail

kubectl apply -f infra/argocd/project.yaml
kubectl apply -f infra/argocd/apps/collector-dev.yaml
kubectl apply -f infra/argocd/apps/collector-preprod.yaml
kubectl apply -f infra/argocd/apps/collector-prod.yaml
