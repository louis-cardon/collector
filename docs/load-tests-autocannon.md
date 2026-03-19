# Load Tests Autocannon

Workflow dedie : `.github/workflows/load-test.yml`

## Objectif

Ce socle lance des tests de charge HTTP simples via `autocannon`, en local ou dans GitHub Actions, sans alourdir la CI principale.

Scenarios unitaires :
- `catalog` : `GET /catalog`
- `categories` : `GET /categories`
- `login` : `POST /auth/login`
- `auth-me` : `GET /auth/me`
- `admin-pending` : `GET /admin/articles/pending`
- `article-create` : `POST /articles`

Groupes disponibles :
- `public` : `catalog`, `categories`
- `auth` : `login`, `auth-me`
- `all` : `catalog`, `categories`, `login`, `auth-me`
- `seller-flow` : `login`, `auth-me`, `article-create`
- `admin` : `admin-pending`
- `full` : tous les scenarios ci-dessus

## Variables utiles

- `LOADTEST_BASE_URL` : URL de base de l'API
- `LOADTEST_USER_EMAIL` et `LOADTEST_USER_PASSWORD` : alias vendeur conserves pour compatibilite
- `LOADTEST_SELLER_EMAIL` et `LOADTEST_SELLER_PASSWORD` : vendeur pour `login`, `auth-me`, `article-create`
- `LOADTEST_ADMIN_EMAIL` et `LOADTEST_ADMIN_PASSWORD` : admin pour `admin-pending`
- `LOADTEST_CATEGORY_ID` : optionnel, pour forcer la categorie utilisee par `article-create`

Exemple fourni :
- [loadtest.env.example](/c:/Users/cardo/Documents/Projet/collector/scripts/load-tests/loadtest.env.example)

## Rejouer en local

Pour la demo Minikube + ingress, la bonne cible est :

```text
http://localhost:8088/api
```

Campagne lecture seule :

```bash
npm run loadtest -- --target all --base-url http://localhost:8088/api --duration 15 --connections 10
```

Campagne seller avec ecriture :

```bash
npm run loadtest -- --target seller-flow --base-url http://localhost:8088/api --duration 15 --connections 10
```

Campagne complete :

```bash
npm run loadtest -- --target full --base-url http://localhost:8088/api --duration 15 --connections 10
```

Scenarios individuels :

```bash
npm run loadtest:catalog -- --base-url http://localhost:8088/api
npm run loadtest:categories -- --base-url http://localhost:8088/api
npm run loadtest:login -- --base-url http://localhost:8088/api
npm run loadtest:auth-me -- --base-url http://localhost:8088/api
npm run loadtest:admin-pending -- --base-url http://localhost:8088/api
npm run loadtest:article-create -- --base-url http://localhost:8088/api
```

Resume Markdown :

```bash
npm run loadtest:summary
```

## Recommande pour la demo locale

1. lancer `npm run demo:local:start`
2. charger les variables depuis `loadtest.env.example`
3. lancer `npm run loadtest -- --target all --base-url http://localhost:8088/api`
4. si tu veux montrer un flux plus metier, lancer `seller-flow` ou `full`
5. ouvrir ensuite `load-test-results/summary.md`

## Effets de bord a connaitre

- `article-create` ecrit en base et cree de vraies annonces `PENDING_REVIEW`
- `admin-pending` necessite un compte admin valide
- `full` lance aussi des scenarios authentifies

## Lecture rapide des resultats

- `Requests` : nombre total de requetes traitees pendant le test
- `Avg latency` : latence moyenne en millisecondes
- `P95` : latence du 95e percentile
- `Errors` : erreurs transport ou runtime detectees par `autocannon`
- `Non-2xx` : reponses HTTP hors succes

Pour une API saine :
- `Errors` doit rester a `0`
- `Non-2xx` doit rester a `0` ou proche de `0`
- `P95` doit rester raisonnable par rapport a la moyenne
