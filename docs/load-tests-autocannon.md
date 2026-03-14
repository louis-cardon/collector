# Load Tests Autocannon

Workflow dedié : `.github/workflows/load-test.yml`

## Objectif

Ce workflow lance des tests de charge HTTP simples contre l'API déployée sur Render, sans alourdir la CI principale.

Scenarios couverts :
- `catalog` : `GET /catalog`
- `login` : `POST /auth/login`

Le workflow est prévu pour la soutenance :
- declenchement manuel avec `workflow_dispatch`
- petite execution planifiee quotidienne
- artefacts JSON exploitables
- resume Markdown lisible dans GitHub Actions

## Secrets GitHub requis

- `LOADTEST_BASE_URL` : URL de base de l'API, par exemple `https://collector-api-f9xu.onrender.com`
- `LOADTEST_USER_EMAIL` : compte de test valide pour le scenario `login`
- `LOADTEST_USER_PASSWORD` : mot de passe du compte de test

## Lancer le workflow manuellement

1. Ouvrir `Actions` dans GitHub.
2. Selectionner le workflow `load-test`.
3. Cliquer sur `Run workflow`.
4. Choisir :
   - `target` : `catalog`, `login` ou `all`
   - `duration` : duree en secondes pour chaque run
   - `connections` : nombre de connexions concurrentes

Le `schedule` quotidien reste leger :
- cible : `catalog`
- duree : `10` secondes
- connexions : `5`

## Recuperer les artifacts

1. Ouvrir le run GitHub Actions.
2. Aller dans la section `Artifacts`.
3. Telecharger `load-test-results-<run_id>`.

Le dossier contient :
- `catalog.json` et/ou `login.json`
- `summary.md`

## Lecture rapide des resultats

- `Requests` : nombre total de requetes traitees pendant le test
- `Avg latency` : latence moyenne en millisecondes
- `P95` : latence du 95e percentile, utile pour les pics
- `Errors` : erreurs transport/runtime detectees par autocannon
- `Non-2xx` : reponses HTTP hors succes

Pour une API saine :
- `Errors` doit rester a `0`
- `Non-2xx` doit rester a `0` ou proche de `0`
- `P95` doit rester raisonnable par rapport a la moyenne

## Rejouer en local

Scripts racine disponibles :

```bash
npm run loadtest -- --target catalog --base-url https://collector-api-f9xu.onrender.com --duration 15 --connections 10
npm run loadtest -- --target login --base-url https://collector-api-f9xu.onrender.com --duration 15 --connections 10
npm run loadtest:summary
```

Variables utiles pour `login` :

```bash
LOADTEST_BASE_URL=https://collector-api-f9xu.onrender.com
LOADTEST_USER_EMAIL=seller@collector.local
LOADTEST_USER_PASSWORD=Seller123!
```
