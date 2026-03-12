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
├─ frontend/
├─ backend/
└─ .github/
   └─ workflows/
```

## Démarrage

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d
npm run prisma:migrate:deploy -w backend
npm run prisma:seed -w backend
npm run dev
```

## Variables d’environnement

- backend : fichier local attendu `backend/.env`
- frontend : fichier local attendu `frontend/.env.local`

Exemples fournis :
- `backend/.env.example`
- `frontend/.env.example`

## Proxy frontend -> backend (dev)

En développement, Next.js proxy les routes frontend `/api/*` vers le backend
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

- `npm run dev` : lance Next.js + NestJS en parallèle
- `npm run build` : build de tous les workspaces
- `npm run lint` : lint de tous les workspaces
- `npm run test` : tests unitaires/intégration de tous les workspaces
- `npm run test:coverage` : couverture de tests
- `npm run test:e2e` : tests e2e API backend (Supertest)
- `npm run test:e2e:playwright` : socle e2e Playwright frontend

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
