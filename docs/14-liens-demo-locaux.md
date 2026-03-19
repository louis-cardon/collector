# Liens de demo locale

Ce document regroupe les URLs et commandes utiles pour la demo locale `Minikube + Argo CD + Grafana`.

## Demarrage rapide

Demarrer toute la demo locale :

```powershell
npm run demo:local:start
```

Ouvrir l'UI Argo CD :

```powershell
npm run argocd:ui
```

Afficher le mot de passe admin Argo CD :

```powershell
npm run argocd:password
```

Tout couper apres la demo :

```powershell
npm run demo:local:stop
```

## Liens principaux

- Front : `http://localhost:8088`
- Swagger API Gateway : `http://localhost:8088/docs`
- Grafana : `http://localhost:3007`
- Dashboard audit Grafana : `http://localhost:3007/d/collector-audit-local/collector-audit-local`
- Argo CD UI : `https://localhost:8080`

## Comptes utiles

Application :

- seller : `seller@collector.local` / `Seller123!`
- admin : `admin@collector.local` / `Admin123!`

Grafana :

- `admin` / `admin`

Argo CD :

- utilisateur : `admin`
- mot de passe : sortie de `npm run argocd:password`

## Liens et cas utiles pendant la demo

- Login seller : `http://localhost:8088/login`
- Catalog public : `http://localhost:8088`
- Login admin : `http://localhost:8088/login`
- Docs OpenAPI : `http://localhost:8088/docs`
- Dashboard audit : `http://localhost:3007/d/collector-audit-local/collector-audit-local`

Emails de demo :

- destinataire de test : `cardonlouis27@gmail.com`
- expediteur : `Acme <onboarding@resend.dev>`
- envoi declenche quand un admin approuve ou rejette une annonce

## Sequence conseillee

1. lancer `npm run demo:local:start`
2. lancer `npm run argocd:ui`
3. ouvrir le front sur `http://localhost:8088`
4. login seller et creer une annonce
5. login admin et approuver ou rejeter l'annonce
6. montrer le mail recu
7. montrer le dashboard Grafana
8. montrer Argo CD si besoin

## Test de charge classique

Campagne recommandee pour la demo :

```powershell
$env:LOADTEST_SELLER_EMAIL="seller@collector.local"
$env:LOADTEST_SELLER_PASSWORD="Seller123!"
$env:LOADTEST_ADMIN_EMAIL="admin@collector.local"
$env:LOADTEST_ADMIN_PASSWORD="Admin123!"
npm run loadtest -- --target all --base-url http://localhost:8088/api --duration 15 --connections 10
```

Resume :

```powershell
npm run loadtest:summary
```

Resultat a montrer :

- fichier : `load-test-results/summary.md`
- interpretation : charge moderee, sans erreurs, sans reponses non-`2xx`

Point d'attention :

- ne pas utiliser `full --connections 100` pour la demo
- `all` est la campagne la plus stable et la plus defendable a l'oral

## Verifications rapides si quelque chose ne repond pas

Verifier les applications Argo CD :

```powershell
kubectl get applications -n argocd
```

Verifier les pods :

```powershell
kubectl get pods -n collector-dev-local
```

Verifier Minikube :

```powershell
minikube status
```
