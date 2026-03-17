#!/usr/bin/env bash

set -euo pipefail

eval "$(minikube -p minikube docker-env)"

docker build -f services/api-gateway/Dockerfile -t collector/api-gateway:latest .
docker build -f services/auth-service/Dockerfile -t collector/auth-service:latest .
docker build -f services/catalog-service/Dockerfile -t collector/catalog-service:latest .
docker build -f services/article-service/Dockerfile -t collector/article-service:latest .
docker build -f services/audit-service/Dockerfile -t collector/audit-service:latest .
docker build -f services/notification-service/Dockerfile -t collector/notification-service:latest .
docker build -f frontend/Dockerfile -t collector/frontend:latest .
