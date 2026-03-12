# 09 - Résultats des tests, de charge et d’observabilité

## 1. Objectif du document

Ce document présente les résultats obtenus sur le prototype Collector à l’issue de l’implémentation de la v1.  
Il a pour objectif de :
- synthétiser les résultats des tests automatisés ;
- présenter les résultats des contrôles qualité et sécurité ;
- exposer les premiers éléments d’observabilité ;
- documenter les résultats des tests de charge ;
- préparer l’analyse de sécurité et le plan de remédiation.

Il constitue le lien entre :
- la stratégie de tests ;
- les métriques qualité définies ;
- la chaîne CI/CD ;
- la soutenance technique ;
- le futur document de plan de remédiation.

## 2. Rappel du périmètre évalué

Le prototype évalué couvre le flux métier suivant :
- authentification d’un vendeur ;
- création d’une annonce ;
- consultation des annonces en attente par un administrateur ;
- approbation ou rejet d’une annonce ;
- publication dans le catalogue public ;
- gestion des catégories par l’administrateur.

Les résultats présentés dans ce document portent uniquement sur ce périmètre et non sur l’ensemble des fonctionnalités prévues à terme pour Collector.

## 3. Environnement de test et de mesure

### 3.1 Version évaluée
- nom de la branche / tag : `[à compléter]`
- date de mesure : `[à compléter]`
- commit évalué : `[à compléter]`

### 3.2 Environnement applicatif
- front : Next.js
- back : NestJS
- base de données : PostgreSQL
- ORM : Prisma
- authentification : JWT
- logs : Pino
- CI/CD : GitHub Actions
- qualité statique : SonarQube

### 3.3 Environnement d’exécution
- environnement local / CI / démo : `[à compléter]`
- fournisseur cloud : `[à compléter]`
- configuration machine de test : `[à compléter]`
- configuration base de données : `[à compléter]`

### 3.4 Outils utilisés pour les mesures
- Jest
- `@nestjs/testing`
- Supertest
- React Testing Library
- Playwright
- SonarQube
- npm audit ou équivalent
- Siege ou JMeter
- logs applicatifs Pino

## 4. Rappel des métriques qualité suivies

Les métriques retenues pour le projet sont :
1. couverture de tests automatisés ;
2. nombre de vulnérabilités critiques ou hautes ;
3. latence p95 des endpoints critiques ;
4. qualité statique du code et dette technique mesurées par SonarQube.

## 5. Résultats des tests automatisés

## 5.1 Résultats globaux

| Type de test | Outil | Exécuté | Résultat | Commentaire |
|---|---|---:|---|---|
| Tests unitaires back | Jest | `[oui/non]` | `[succès/échec]` | `[à compléter]` |
| Tests d’intégration API | Jest + Supertest | `[oui/non]` | `[succès/échec]` | `[à compléter]` |
| Tests unitaires front | Jest + RTL | `[oui/non]` | `[succès/échec]` | `[à compléter]` |
| Tests E2E / acceptation | Playwright | `[oui/non]` | `[succès/échec]` | `[à compléter]` |
| Smoke tests post-déploiement | `[outil]` | `[oui/non]` | `[succès/échec]` | `[à compléter]` |

## 5.2 Résultats détaillés des tests unitaires back

### Nombre total
- nombre de tests exécutés : `[à compléter]`
- nombre de tests réussis : `[à compléter]`
- nombre de tests échoués : `[à compléter]`

### Modules couverts
- `AuthService` : `[à compléter]`
- `ArticlesService` : `[à compléter]`
- `AdminService` : `[à compléter]`
- `CategoriesService` : `[à compléter]`

### Points validés
- statut initial `PENDING_REVIEW` à la création : `[OK / NOK]`
- transitions de statut autorisées : `[OK / NOK]`
- refus des transitions interdites : `[OK / NOK]`
- contrôle des autorisations métier : `[OK / NOK]`

### Analyse
`[à compléter avec 5 à 10 lignes]`

## 5.3 Résultats détaillés des tests d’intégration API

### Nombre total
- nombre de scénarios exécutés : `[à compléter]`
- nombre de scénarios réussis : `[à compléter]`
- nombre de scénarios échoués : `[à compléter]`

### Résultats par endpoint

| Endpoint | Cas testé | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|
| `POST /auth/login` | login valide | `200` | `[à compléter]` | `[OK/NOK]` |
| `POST /auth/login` | login invalide | `401` | `[à compléter]` | `[OK/NOK]` |
| `POST /articles` | seller authentifié | `201` | `[à compléter]` | `[OK/NOK]` |
| `POST /articles` | sans token | `401` | `[à compléter]` | `[OK/NOK]` |
| `GET /admin/articles/pending` | admin authentifié | `200` | `[à compléter]` | `[OK/NOK]` |
| `GET /admin/articles/pending` | seller authentifié | `403` | `[à compléter]` | `[OK/NOK]` |
| `POST /admin/articles/:id/approve` | admin | `200` | `[à compléter]` | `[OK/NOK]` |
| `POST /admin/articles/:id/approve` | seller | `403` | `[à compléter]` | `[OK/NOK]` |
| `GET /catalog` | accès public | `200` | `[à compléter]` | `[OK/NOK]` |
| `GET /catalog` | uniquement `APPROVED` visibles | conforme | `[à compléter]` | `[OK/NOK]` |
| `POST /admin/categories` | admin authentifié | `201` | `[à compléter]` | `[OK/NOK]` |
| `POST /admin/categories` | seller authentifié | `403` | `[à compléter]` | `[OK/NOK]` |

### Analyse
`[à compléter avec les réussites, les échecs et ce qu’ils montrent sur la conformité fonctionnelle]`

## 5.4 Résultats des tests front

### Périmètre couvert
- formulaire de création d’annonce : `[OK / NOK]`
- messages de validation : `[OK / NOK]`
- affichage des catégories : `[OK / NOK]`
- rendu conditionnel selon le statut : `[OK / NOK]`

### Analyse
`[à compléter]`

## 5.5 Résultats des tests E2E / d’acceptation

### Scénarios exécutés

| ID scénario | Description | Résultat |
|---|---|---|
| E2E-01 | seller se connecte et crée une annonce | `[OK/NOK]` |
| E2E-02 | admin approuve une annonce | `[OK/NOK]` |
| E2E-03 | l’annonce approuvée apparaît dans le catalogue public | `[OK/NOK]` |
| E2E-04 | un admin crée une catégorie utilisée ensuite lors de la création d’une annonce | `[OK/NOK]` |

### Analyse
`[à compléter]`

## 6. Résultats de couverture de tests

## 6.1 Synthèse

| Zone mesurée | Couverture lignes | Couverture branches | Objectif | Statut |
|---|---:|---:|---:|---|
| Back-end global | `[x %]` | `[x %]` | `>= 80 %` | `[OK/NOK]` |
| Services métier | `[x %]` | `[x %]` | `>= 80 %` | `[OK/NOK]` |
| Front ciblé | `[x %]` | `[x %]` | `[à compléter]` | `[OK/NOK]` |

## 6.2 Interprétation
`[à compléter]`

### Exemple d’analyse attendue
- la logique métier principale est correctement couverte ;
- certaines zones secondaires restent moins couvertes ;
- la couverture est suffisante pour limiter les régressions sur le parcours critique.

## 7. Résultats SonarQube et qualité statique

## 7.1 Résultats globaux

| Indicateur SonarQube | Valeur obtenue | Objectif | Statut |
|---|---:|---:|---|
| Maintainability rating | `[A/B/C...]` | `A` | `[OK/NOK]` |
| Duplicated lines density | `[x %]` | `< 3 %` | `[OK/NOK]` |
| Code smells | `[x]` | `0 critique / blocker sur nouveau code` | `[OK/NOK]` |
| Technical debt ratio | `[x %]` | `[à compléter]` | `[OK/NOK]` |
| Quality gate | `[pass/fail]` | `pass` | `[OK/NOK]` |

## 7.2 Analyse détaillée
`[à compléter]`

### Points à documenter
- duplications détectées ;
- zones de code trop complexes ;
- éventuels smells majeurs ;
- écarts acceptables ou non ;
- impact sur la maintenabilité future.

## 8. Résultats du scan de vulnérabilités

## 8.1 Résultats synthétiques

| Type de vulnérabilité | Front | Back | Total |
|---|---:|---:|---:|
| Critical | `0` | `0` | `0` |
| High | `0` | `0` | `0` |
| Moderate | `0` | `8` | `8` |
| Low | `0` | `0` | `0` |

## 8.2 Analyse
Le scan de dépendances a été exécuté le **12 mars 2026** via `npm audit` sur le monorepo (`--workspaces --include-workspace-root`) puis par workspace.

Constats principaux :
- aucune vulnérabilité `High` ou `Critical` ;
- `8` vulnérabilités `Moderate`, toutes côté back (`backend`) ;
- aucune vulnérabilité côté front (`frontend`).

Dépendances concernées :
- runtime API : `@nestjs/common` via `file-type@21.3.0` (advisory `GHSA-5v7r-6r5c-r473`) ;
- tooling back : `@nestjs/cli` et `@nestjs/schematics` via `@angular-devkit/*` et `ajv` (advisory `GHSA-2g4f-4pwh-qvx6`).

Analyse d’exploitabilité :
- `ajv` est dans la chaîne de tooling Nest/Angular Devkit (scaffolding/build), pas dans l’exposition directe des routes runtime de l’API ;
- `file-type` est transitif via Nest et n’est pas utilisé explicitement dans les parcours métier actuellement implémentés (pas de parsing binaire d’upload en production dans ce POC).

Remédiation immédiate évaluée :
- `npm audit fix --dry-run` ne propose pas de correctif non-breaking applicable ;
- les versions Nest installées sont déjà sur leurs derniers patchs disponibles à date ;
- les upgrades proposés automatiquement par `npm audit` pointent vers des majors incohérentes pour la stack courante et ne sont pas retenus.

### Points à commenter
- présence ou non de vulnérabilités critiques ;
- dépendances concernées ;
- correctifs immédiats possibles ;
- vulnérabilités acceptées temporairement avec justification.

## 8.3 Conclusion sécurité dépendances
La métrique projet est respectée sur le critère bloquant (`0 High`, `0 Critical`).  
Les vulnérabilités `Moderate` restantes sont documentées, suivies et classées en dette de sécurité maîtrisée à court terme, avec action de surveillance active des releases upstream NestJS/Angular Devkit.

## 9. Résultats d’observabilité

## 9.1 Logs applicatifs

### Logs vérifiés
- démarrage de l’application : `[OK/NOK]`
- erreur d’authentification : `[OK/NOK]`
- création d’annonce : `[OK/NOK]`
- approbation d’annonce : `[OK/NOK]`
- refus d’accès sur route admin : `[OK/NOK]`

### Exemples de traces observées
- création d’annonce par seller : `[à compléter]`
- approbation par admin : `[à compléter]`
- refus d’accès : `[à compléter]`

### Analyse
`[à compléter]`

## 9.2 Audit métier

### Vérifications réalisées
- identifiant de l’admin enregistré : `[OK/NOK]`
- date de décision enregistrée : `[OK/NOK]`
- type d’action enregistré : `[OK/NOK]`
- ressource concernée identifiable : `[OK/NOK]`

### Analyse
`[à compléter]`

## 9.3 Métriques HTTP minimales

| Indicateur | Valeur | Commentaire |
|---|---:|---|
| Nombre total de requêtes observées | `[x]` | `[à compléter]` |
| Taux d’erreur HTTP | `[x %]` | `[à compléter]` |
| Endpoint le plus sollicité | `[à compléter]` | `[à compléter]` |
| Endpoint le plus lent | `[à compléter]` | `[à compléter]` |

## 10. Résultats des tests de charge

## 10.1 Objectif
Les tests de charge ont pour objectif de mesurer le comportement du prototype sur quelques endpoints critiques, conformément aux exigences de soutenance.

## 10.2 Configuration des tests

### Outil utilisé
- `Siege` (workflow dédié `.github/workflows/performance.yml`)

### Environnement de test
- URL ciblée : `http://127.0.0.1:3001`
- date : `[à compléter]`
- nombre d’utilisateurs simulés : `[à compléter via input workflow users]`
- durée : `[à compléter via input workflow duration]`
- endpoints testés :
  - `GET /catalog`
  - `GET /categories`
  - `POST /auth/login`
  - `GET /auth/me` (scénario protégé avec JWT)

### Artefacts de campagne
- `load-test-results/summary.md`
- `load-test-results/summary.csv`
- logs bruts des scénarios (`*.log`)
- `backend.log`

## 10.3 Résultats synthétiques

| Endpoint | Nombre de requêtes | Temps moyen | p95 | Taux d’erreur | Statut |
|---|---:|---:|---:|---:|---|
| `GET /catalog` | `[x]` | `[x ms]` | `[x ms]` | `[x %]` | `[OK/NOK]` |
| `POST /auth/login` | `[x]` | `[x ms]` | `[x ms]` | `[x %]` | `[OK/NOK]` |
| `POST /articles` | `[x]` | `[x ms]` | `[x ms]` | `[x %]` | `[OK/NOK]` |

## 10.4 Analyse détaillée

### Catalogue public
`[à compléter]`

### Authentification
`[à compléter]`

### Création d’annonce
`[à compléter]`

### Lecture globale
`[à compléter]`

### Exemple d’angle d’analyse
- le catalogue supporte correctement une charge modérée ;
- l’authentification est plus coûteuse ;
- la création d’annonce est plus sensible car elle écrit en base et manipule davantage de validations.

## 11. Évaluation des métriques qualité

## 11.1 Synthèse

| Métrique | Objectif | Résultat obtenu | Statut |
|---|---:|---:|---|
| Couverture de tests | `>= 80 %` | `[x %]` | `[OK/NOK]` |
| Vulnérabilités High / Critical | `0` | `0` | `OK` |
| Latence p95 endpoints critiques | `< 300 ms` | `[x ms]` | `[OK/NOK]` |
| Qualité statique SonarQube | `Quality gate OK / rating A / duplication < 3 %` | `[à compléter]` | `[OK/NOK]` |

## 11.2 Analyse synthétique
`[à compléter en 10 à 15 lignes]`

## 12. Écarts observés et points d’attention

## 12.1 Écarts fonctionnels
`[à compléter]`

## 12.2 Écarts techniques
`[à compléter]`

## 12.3 Écarts sécurité
- pas d’écart bloquant sur le seuil sécurité défini (aucune vulnérabilité `High`/`Critical`) ;
- présence d’un écart non bloquant : `8` vulnérabilités `Moderate` sur des dépendances back majoritairement transitives ;
- aucun correctif non-breaking disponible automatiquement via `npm audit fix` à date ;
- décision : acceptation temporaire documentée, avec suivi des versions upstream et re-scan régulier.

## 12.4 Écarts performance
`[à compléter]`

## 12.5 Dette technique identifiée
`[à compléter]`

## 13. Premières hypothèses de risques

À partir des résultats précédents, les risques potentiels identifiés sont les suivants :

### Risques de sécurité
- risque résiduel modéré lié à des dépendances transitives de la toolchain back ;
- risque d’augmentation future si ces dépendances ne sont pas suivies sur plusieurs itérations.

### Risques de disponibilité
- `[à compléter]`

### Risques de maintenabilité
- `[à compléter]`

### Risques de régression
- `[à compléter]`

### Risques de montée en charge
- `[à compléter]`

## 14. Préparation du plan de remédiation

Les résultats de ce document serviront directement à alimenter le plan de remédiation du document suivant.

### Sujets susceptibles de passer en priorité 1
- conserver la correction immédiate en cas d’apparition d’une vulnérabilité `High` ou `Critical`.

### Sujets susceptibles de passer en priorité 2
- remédiation des vulnérabilités `Moderate` dépendantes d’upstream (`@nestjs/common`, `@nestjs/cli`, `@nestjs/schematics`) dès disponibilité d’un patch compatible.

### Sujets susceptibles de passer en priorité 3
- `[à compléter]`

## 15. Éléments à montrer en soutenance

Pour la démonstration orale, les éléments suivants devront être préparés :

- résultat d’un test d’intégration API sur le flux critique ;
- résultat d’un test E2E ou d’acceptation ;
- capture du rapport de couverture ;
- capture SonarQube ;
- capture du scan de vulnérabilités ;
- logs de création et d’approbation d’annonce ;
- résultat d’un test de charge avec lecture des temps de réponse et du taux d’erreur.

## 16. Conclusion

Les résultats présentés dans ce document permettent d’évaluer concrètement la qualité du prototype Collector sur quatre axes :
- conformité fonctionnelle ;
- sécurité minimale ;
- performance ;
- maintenabilité.

Ils constituent la base factuelle nécessaire pour :
- défendre le prototype en soutenance ;
- justifier les métriques qualité ;
- analyser les vulnérabilités potentielles ;
- préparer un plan de remédiation priorisé et cohérent avec le contexte de l’application.
