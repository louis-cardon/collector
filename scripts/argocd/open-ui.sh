#!/usr/bin/env bash

set -euo pipefail

kubectl port-forward svc/argocd-server -n argocd 8080:443
