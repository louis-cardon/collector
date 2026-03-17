# 12 - Runtime Docker Compose

## Objectif

Ce document decrit la stack `docker compose` de reference pour demontrer :
- le decoupage applicatif ;
- la deploiabilite locale reproductible ;
- l'observabilite ;
- les bonnes pratiques de securite ;
- la maintenabilite d'exploitation.

## Principes retenus

- un point d'entree unique via `nginx` ;
- un reseau public limite au reverse proxy ;
- un reseau interne dedie aux microservices ;
- une migration Prisma automatique ;
- un seed manuel pour garder la maitrise des donnees de demo ;
- des healthchecks sur chaque composant critique ;
- des profils optionnels pour ne pas imposer les outils d'observabilite et de securite a chaque lancement.

## Services applicatifs

- `reverse-proxy` : termine l'exposition HTTP, applique des headers de securite et une limitation de debit sur `/api/auth/login`
- `frontend` : interface Next.js
- `api-gateway` : point d'entree unique cote API
- `auth-service`
- `catalog-service`
- `article-service`
- `audit-service`
- `notification-service`
- `postgres`
- `auth-migrate` : applique les migrations Prisma
- `db-seed` : profile `ops`, injecte les donnees de demonstration

## Observabilite

Le profil `observability` active :
- `Prometheus` pour la collecte des metriques
- `Grafana` pour la visualisation
- `cAdvisor` pour les metriques conteneurs
- `blackbox-exporter` pour superviser les endpoints HTTP critiques
- `postgres-exporter` pour les metriques PostgreSQL
- `Dozzle` pour la consultation centralisee des logs Docker

Cette approche reste simple, tout en fournissant des preuves concretes pour :
- la disponibilite ;
- la supervision ;
- la capacite de diagnostic ;
- la mesure de performance et de fiabilite.

## Securite

Les pratiques explicites integrees a la stack sont :
- secrets externalises via `.env.compose`
- reseau interne `backend` non expose
- exposition publique limitee au reverse proxy
- headers de securite HTTP au niveau `nginx`
- limitation de debit sur l'endpoint de login
- options `no-new-privileges`
- `cap_drop: ALL` sur les services applicatifs
- healthchecks et dependances explicites pour eviter les demarrages partiels
- scans optionnels `Trivy` et `Gitleaks`

## Commandes utiles

```bash
cp .env.compose.example .env.compose
mkdir -p reports/security
npm run compose:up
npm run compose:seed
npm run compose:observability:up
npm run compose:security:trivy
npm run compose:security:gitleaks
npm run compose:logs
npm run compose:down
```
