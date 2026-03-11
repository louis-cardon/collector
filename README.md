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
