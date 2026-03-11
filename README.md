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
├─ .env.example
├─ docs/
├─ frontend/
├─ backend/
└─ .github/
   └─ workflows/
