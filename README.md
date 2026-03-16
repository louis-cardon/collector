# Collector.shop — Prototype v1

Prototype technique d’une marketplace d’objets de collection entre particuliers.

## Objectif

Ce dépôt contient un **POC v1** centré sur un flux métier principal :

1. un vendeur s’authentifie ;
2. le vendeur crée une annonce ;
3. l’annonce est enregistrée avec le statut `PENDING_REVIEW` ;
4. un administrateur consulte les annonces en attente ;
5. l’administrateur approuve ou rejette l’annonce ;
6. les annonces approuvées deviennent visibles dans le catalogue public.

Ce projet est volontairement limité à un périmètre réduit mais cohérent, afin de démontrer :
- la faisabilité technique ;
- la qualité logicielle ;
- la sécurité minimale ;
- les tests ;
- la CI/CD ;
- la déployabilité ;
- l’observabilité.

## Périmètre

### Inclus
- authentification
- rôles `seller` et `admin`
- gestion des catégories par l’administrateur
- création d’annonce par un vendeur
- validation / rejet par un administrateur
- catalogue public avec uniquement les annonces approuvées
- logs structurés
- tests automatisés
- base CI/CD

### Hors périmètre
- paiement
- chat
- notifications
- fraude
- recommandations
- internationalisation
- accessibilité avancée

## Stack technique

### Frontend
- Next.js
- TypeScript
- React Hook Form
- Zod

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT
- ValidationPipe + DTO
- Swagger / OpenAPI
- Pino

### Qualité / tests
- Jest
- Supertest
- React Testing Library
- Playwright
- SonarQube
- GitHub Actions

## Structure du dépôt

```text
.
├─ AGENTS.md
├─ README.md
├─ .gitignore
├─ package.json
├─ docs/
├─ services/
├─ frontend/
├─ backend/
└─ .github/
   └─ workflows/
```

## Architecture microservices

Une nouvelle architecture `services/` est introduite et constitue desormais la topologie de reference pour l'execution locale et Kubernetes :
- `services/api-gateway` : point d'entree unique pour le frontend
- `services/auth-service` : login, JWT, utilisateur courant
- `services/catalog-service` : catalogue public et categories
- `services/article-service` : creation d'annonce et revue admin
- `services/audit-service` : journal d'audit
- `services/notification-service` : emails / notifications

Le dossier `backend/` reste present comme reference fonctionnelle et comme source Prisma tant que la migration complete n'est pas terminee, mais l'application s'utilise desormais via `services/`.

## Démarrage

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/catalog-service/.env.example services/catalog-service/.env
cp services/article-service/.env.example services/article-service/.env
cp services/audit-service/.env.example services/audit-service/.env
cp services/notification-service/.env.example services/notification-service/.env
docker compose up -d
npm run prisma:migrate:deploy -w backend
npm run prisma:seed -w backend
npm run dev
```

Les variables d'environnement de chaque service sont documentees dans `services/*/.env.example`.

## Variables d’environnement

- backend : fichier local attendu `backend/.env` pour Prisma / migration transitoire
- frontend : fichier local attendu `frontend/.env.local`
- microservices : fichiers locaux attendus `services/*/.env`

Exemples fournis :
- `backend/.env.example`
- `frontend/.env.example`

## Proxy frontend -> backend (dev)

En développement, Next.js proxy les routes frontend `/api/*` vers l'API Gateway
`http://127.0.0.1:3001/*` via `frontend/next.config.ts`.

Conséquence :
- le navigateur appelle uniquement des routes relatives (`/api/catalog`, `/api/categories`, `/api/auth/login`, etc.) ;
- les appels frontend n’exposent plus directement l’URL backend publique ;
- les problèmes CORS entre tunnels 3000/3001 sont évités côté navigateur.

## PostgreSQL local (Docker Compose)

Le monorepo fournit un `compose.yaml` à la racine avec un service PostgreSQL 16.

```bash
docker compose up -d
docker compose down
```

Utilisation avec Prisma (backend) :

```bash
npm run prisma:generate -w backend
npm run prisma:migrate:deploy -w backend
npm run prisma:seed -w backend
```

## Scripts racine

- `npm run dev` : lance Next.js + l'ensemble des microservices
- `npm run dev:microservices` : lance uniquement les microservices
- `npm run build` : build de tous les workspaces
- `npm run lint` : lint de tous les workspaces
- `npm run test` : tests unitaires/intégration de tous les workspaces
- `npm run test:coverage` : couverture de tests
- `npm run test:e2e` : tests end-to-end Playwright
- `npm run test:e2e:playwright` : socle e2e Playwright frontend
- `npm run docker:build:microservices` : construit les images frontend + microservices

## Kubernetes

Le dossier `infra/k8s` deploie maintenant :
- `frontend`
- `api-gateway`
- `auth-service`
- `catalog-service`
- `article-service`
- `audit-service`
- `notification-service`
- `postgres`

Pour Minikube :

```bash
minikube start
minikube addons enable ingress
eval "$(minikube docker-env)"
npm run docker:build:microservices
npm run k8s:apply:dev
kubectl get pods -n collector-dev
minikube ip
```

## Deploiement Vercel + Render + Neon

Cette architecture peut etre deployee sans Kubernetes :
- `frontend` sur Vercel
- `api-gateway` et les 5 microservices sur Render
- PostgreSQL sur Neon

### Vercel

Configurer un projet Vercel avec :
- `Root Directory` : `frontend`
- commande de build par defaut Next.js
- variable d'environnement :

```env
NEXT_PUBLIC_API_BASE_URL=https://collector-api-gateway.onrender.com
```

### Render

Le fichier [render.yaml](/Users/louiscardon/Documents/Projet/collector/render.yaml) decrit les 6 services :
- `collector-api-gateway`
- `collector-auth-service`
- `collector-catalog-service`
- `collector-article-service`
- `collector-audit-service`
- `collector-notification-service`

Chaque service utilise son Dockerfile dans `services/*/Dockerfile`.

Variables sensibles a renseigner dans Render :
- `DATABASE_URL` : URL Neon
- `JWT_SECRET`
- `INTERNAL_SERVICE_TOKEN`
- `CORS_ALLOWED_ORIGINS`
- `RESEND_API_KEY`
- `NOTIFICATIONS_FROM_EMAIL`

### Neon

Neon reste la base PostgreSQL de reference. A ce stade, les microservices partagent encore le meme `DATABASE_URL`, le temps de finaliser l'extraction Prisma hors de `backend/`.

## CI/CD GitHub Actions

Workflow principal : `.github/workflows/ci.yml`

Jobs :
- `quality-and-tests` :
  - `npm ci`
  - lint frontend et backend
  - build frontend et backend
  - tests frontend et backend
  - tests e2e backend
  - coverage + upload d’artefacts
- `dependency-vulnerability-scan` :
  - `npm audit` (seuil `high`)
- `sonarqube-analysis` :
  - exécution conditionnelle si secrets Sonar présents
  - attend le `Quality Gate` SonarQube (échec du job si gate en échec)
- `playwright-smoke` :
  - job manuel (`workflow_dispatch`)

Secrets GitHub optionnels (SonarQube) :
- `SONAR_TOKEN`
- `SONAR_HOST_URL`

Configuration recommandée des secrets dans le repository GitHub :
- `SONAR_TOKEN` : token d’analyse généré côté SonarQube (scope analyse de projet)
- `SONAR_HOST_URL` : URL de votre serveur SonarQube (ex. `https://sonar.example.com`)

Note :
- `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions et utilisé pour le contexte PR.

Sans ces deux secrets, le job SonarQube est ignoré.

## Workflow performance (non bloquant)

Workflow dédié : `.github/workflows/performance.yml`

Objectif :
- exécuter une campagne de charge séparée de la CI qualité ;
- produire des métriques exploitables pour la documentation et la soutenance ;
- ne pas ralentir les validations push/PR.

Déclencheurs :
- manuel (`workflow_dispatch`) ;
- hebdomadaire (lundi, 04:00 UTC) via `schedule`.

Scénarios exécutés :
- `GET /catalog`
- `GET /categories`
- `POST /auth/login`
- `GET /auth/me` (avec token JWT récupéré après login)

Outillage :
- `Siege` (installé dans le job GitHub Actions)
- script : `backend/load-tests/run-performance.sh`
- endpoints publics : `backend/load-tests/endpoints-public.txt`

Artefacts produits :
- `load-test-results/summary.md` (résumé lisible)
- `load-test-results/summary.csv` (données synthétiques)
- logs bruts par scénario (`*.log`)
- `backend.log` (logs API de la campagne)

Le résumé est aussi publié dans l’onglet `Summary` du run GitHub Actions.

### Lancer manuellement

1. Ouvrir `Actions` dans GitHub.
2. Sélectionner le workflow `performance`.
3. Cliquer sur `Run workflow`.
4. Renseigner éventuellement :
   - `users` (concurrence Siege, défaut `20`)
   - `duration` (durée Siege, défaut `30S`)

### Interpréter les résultats

Dans `summary.md`, suivre en priorité :
- `Availability` : proche de `100%` ;
- `Response time` : temps moyen de réponse ;
- `Transaction rate` : débit de requêtes ;
- `Failed transactions` : doit rester bas ;
- `Longest transaction` : identifie les pics de latence.

Ces résultats alimentent ensuite `docs/09-resultats-tests-charge-observabilite.md` et le plan de remédiation.

## Posture vulnérabilités dépendances

La CI bloque sur les vulnérabilités `Critical` et alerte sur les `High`, conformément aux métriques qualité du projet.

Commandes utiles :

```bash
npm audit --workspaces --include-workspace-root
npm audit -w backend
npm audit -w frontend
```

Posture retenue pour le POC :
- corriger immédiatement les vulnérabilités `Critical` et `High` ;
- appliquer uniquement les correctifs non-breaking sûrs ;
- documenter les vulnérabilités `Moderate` restantes (notamment transitives/tooling) avec justification ;
- revalider à chaque itération CI et appliquer les patchs upstream dès disponibilité.
