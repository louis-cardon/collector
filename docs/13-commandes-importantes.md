# 13 - Commandes importantes

Seulement les commandes utiles pour faire tourner, verifier et deployer le projet.

## Demarrage local utile

Installer les dependances :

```bash
npm install
```

Lancer toute l'application en local :

```bash
npm run dev
```

Lancer uniquement les microservices :

```bash
npm run dev:microservices
```

## Docker Compose

Demarrer la stack complete :

```bash
npm run compose:up
```

Seeder la base de demo :

```bash
npm run compose:seed
```

Verifier l'etat de la stack :

```bash
npm run compose:ps
```

Suivre les logs :

```bash
npm run compose:logs
```

Arreter la stack :

```bash
npm run compose:down
```

Acces principal :

- application : `http://localhost:8080`
- docs API gateway : `http://localhost:8080/docs`

## Tests vraiment utiles

Lancer tous les tests declares :

```bash
npm run test
```

Lancer la couverture :

```bash
npm run test:coverage
```

Lancer les e2e Playwright :

```bash
npm run test:e2e
```

Lancer les e2e backend historiques :

```bash
npm run test:e2e -w backend
```

## Base de donnees / Prisma

Appliquer les migrations :

```bash
npm run prisma:migrate:deploy -w backend
```

Seeder la base :

```bash
npm run prisma:seed -w backend
```

## Build d'images

Builder toutes les images utiles :

```bash
npm run docker:build:microservices
```

## Minikube

Demarrer Minikube :

```bash
minikube start
```

Activer l'ingress :

```bash
minikube addons enable ingress
```

Builder les images dans Minikube :

```bash
npm run minikube:build-images
```

Sous Windows PowerShell :

```powershell
npm run minikube:build-images:windows
```

Deployer l'overlay dev :

```bash
npm run k8s:apply:dev
```

Verifier les pods :

```bash
kubectl get pods -n collector-dev
```

## Argo CD

Installer Argo CD :

```bash
npm run argocd:install
```

Sous Windows PowerShell :

```powershell
npm run argocd:install:windows
```

Bootstrap de l'environnement dev :

```bash
npm run argocd:bootstrap:dev
```

Sous Windows PowerShell :

```powershell
npm run argocd:bootstrap:dev:windows
```

Bootstrap des 3 environnements :

```bash
npm run argocd:bootstrap:all-envs
```

Sous Windows PowerShell :

```powershell
npm run argocd:bootstrap:all-envs:windows
```

Voir les apps Argo CD :

```bash
kubectl get applications -n argocd
```

Recuperer le mot de passe admin :

```bash
npm run argocd:password
```

Sous Windows PowerShell :

```powershell
npm run argocd:password:windows
```

Ouvrir l'UI Argo CD :

```bash
npm run argocd:ui
```

Sous Windows PowerShell :

```powershell
npm run argocd:ui:windows
```

## Les 3 sequences utiles

Sequence locale simple :

```bash
npm install
npm run compose:up
npm run compose:seed
```

Sequence qualite :

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

Sequence Minikube + Argo CD :

```bash
minikube start
minikube addons enable ingress
npm run minikube:build-images
npm run argocd:install
npm run argocd:bootstrap:dev
```

Sequence Minikube + Argo CD sous Windows PowerShell :

```powershell
minikube start
minikube addons enable ingress
npm run minikube:build-images:windows
npm run argocd:install:windows
npm run argocd:bootstrap:dev:windows
```
