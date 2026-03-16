# Microservices

Architecture mise en place :
- `api-gateway` : point d'entree unique pour le frontend
- `auth-service` : login, JWT, utilisateur courant
- `catalog-service` : catalogue public et categories
- `article-service` : creation d'annonce et revue admin
- `audit-service` : journal d'audit
- `notification-service` : envoi d'emails / notifications

## Ports locaux

- `api-gateway` : `3001`
- `auth-service` : `3002`
- `catalog-service` : `3003`
- `article-service` : `3004`
- `audit-service` : `3005`
- `notification-service` : `3006`

## Demarrage local

1. Copier chaque `.env.example` en `.env`.
2. Demarrer PostgreSQL.
3. Lancer `npm install` a la racine.
4. Lancer `npm run dev:microservices`.

Le frontend continue d'appeler les routes historiques (`/auth`, `/articles`, `/admin/...`, `/catalog`, `/categories`) via le gateway.
