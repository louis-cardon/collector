# 07 - Compétences nécessaires au projet et action de formation

## 1. Objectif du document

Ce document a pour objectif :
- de cartographier les compétences nécessaires à la réussite du projet Collector.shop ;
- d’identifier les compétences critiques pour le périmètre retenu du POC ;
- de positionner ces compétences par rôle dans l’équipe ;
- d’identifier les zones de risque ou de montée en compétence ;
- de proposer une action de formation cohérente avec le projet.

Cette démarche répond directement aux consignes de structuration du processus de développement, qui demandent de cartographier les compétences nécessaires au projet et de proposer une action de formation pour renforcer les compétences de l’équipe.

## 2. Contexte pris en compte

Le contexte Collector précise que la start-up dispose déjà d’une nouvelle équipe IT composée :
- d’un lead developer ;
- de deux développeurs confirmés avec environ cinq ans d’expérience ;
- avec la possibilité de recruter de nouveaux profils si nécessaire.

Le projet à réaliser est une application web de vente d’objets de collection entre particuliers, avec :
- un catalogue public ;
- des espaces authentifiés vendeur / acheteur ;
- un rôle administrateur pour le back-office ;
- des exigences fortes de sécurité ;
- un besoin d’évolution rapide de l’architecture ;
- un pipeline CI/CD, une observabilité minimale et un déploiement cloud pour la v1.

Le POC retenu dans le cadre de cette évaluation se concentre sur :
- l’authentification ;
- la création d’annonce par un vendeur ;
- la validation ou le rejet par un administrateur ;
- la publication dans le catalogue public ;
- la gestion des catégories.

## 3. Hypothèse d’organisation retenue pour le projet

Pour rester cohérent avec le contexte de l’entreprise et avec un projet de type start-up, l’organisation cible retenue est la suivante :

### Équipe existante
- 1 Lead Developer
- 2 Développeurs confirmés

### Renforts raisonnables envisagés
- 1 profil QA / automatisation de tests à temps partiel ou mutualisé
- 1 profil DevOps / Cloud à temps partiel ou mutualisé

Cette hypothèse reste réaliste :
- elle ne suppose pas une équipe surdimensionnée ;
- elle évite de chercher un profil unique cumulant expertise front, back, sécurité, cloud, observabilité et automatisation de tests ;
- elle permet de répartir les responsabilités sans recourir à des « moutons à 5 pattes ».

## 4. Principes de cartographie des compétences

Les compétences nécessaires au projet sont regroupées en six domaines :

1. compétences produit et métier ;
2. compétences front-end ;
3. compétences back-end ;
4. compétences données et persistance ;
5. compétences qualité / tests ;
6. compétences sécurité, CI/CD, cloud et observabilité.

Cette organisation est cohérente avec :
- le périmètre fonctionnel du prototype ;
- l’architecture retenue ;
- la démarche DevSecOps définie ;
- les exigences du sujet en matière de qualité, sécurité, expérimentation, pipeline et déploiement.

## 5. Cartographie des compétences nécessaires

## 5.1 Compétences produit et métier

### Compétences attendues
- compréhension du domaine marketplace C2C ;
- compréhension des rôles utilisateur : visiteur, seller, admin ;
- compréhension du cycle de vie d’une annonce ;
- capacité à traduire les exigences en backlog et critères d’acceptation ;
- capacité à prioriser une v1 de prototype ;
- capacité à prendre en compte les contraintes de sécurité métier.

### Pourquoi ces compétences sont nécessaires
Le contexte Collector impose :
- plusieurs rôles utilisateur ;
- des espaces authentifiés ;
- un contrôle des annonces avant publication ;
- une forte exigence de sécurité ;
- une architecture capable d’évoluer rapidement.

### Niveau attendu
- **Lead Developer** : fort
- **Développeurs confirmés** : intermédiaire à fort
- **QA** : intermédiaire

## 5.2 Compétences front-end

### Compétences attendues
- développement d’interface web avec Next.js et TypeScript ;
- gestion du routage et des pages sécurisées ;
- intégration avec une API REST ;
- gestion d’état simple côté interface ;
- mise en œuvre de formulaires ;
- validation des données avec React Hook Form et Zod ;
- affichage conditionnel selon les rôles et les statuts ;
- gestion minimale de l’accessibilité sur les écrans principaux.

### Pourquoi ces compétences sont nécessaires
Le prototype comporte :
- un catalogue public ;
- un espace seller ;
- un espace admin ;
- des formulaires de création d’annonce ;
- des vues conditionnelles selon le rôle et le statut des annonces.

### Niveau attendu
- **Lead Developer** : intermédiaire à fort
- **Développeur full-stack orienté front** : fort
- **Développeur full-stack orienté back** : intermédiaire

## 5.3 Compétences back-end

### Compétences attendues
- conception et développement d’API REST avec NestJS ;
- structuration d’une application modulaire ;
- mise en œuvre des DTOs, ValidationPipe et Guards ;
- gestion de l’authentification JWT ;
- gestion de l’autorisation par rôles ;
- implémentation de la logique métier ;
- documentation d’API avec Swagger / OpenAPI ;
- gestion propre des erreurs applicatives.

### Pourquoi ces compétences sont nécessaires
Le cœur du POC repose sur l’API :
- login ;
- création d’annonce ;
- protection des routes seller et admin ;
- validation / rejet ;
- publication dans le catalogue ;
- sécurisation des accès.

### Niveau attendu
- **Lead Developer** : fort
- **Développeur full-stack orienté back** : fort
- **Développeur full-stack orienté front** : intermédiaire

## 5.4 Compétences données et persistance

### Compétences attendues
- modélisation relationnelle ;
- conception de schémas Prisma ;
- manipulation de PostgreSQL ;
- gestion des migrations ;
- distinction entre données métier, audit et données techniques ;
- conception de requêtes efficaces pour les parcours critiques ;
- gestion des relations entre utilisateurs, annonces, catégories et images.

### Pourquoi ces compétences sont nécessaires
Le prototype repose sur plusieurs entités liées :
- utilisateurs ;
- rôles ;
- annonces ;
- catégories ;
- images ;
- audit des actions d’administration.

### Niveau attendu
- **Lead Developer** : intermédiaire à fort
- **Développeur back** : fort
- **Développeur front** : intermédiaire

## 5.5 Compétences qualité et tests

### Compétences attendues
- définition d’une politique de tests ;
- écriture de tests unitaires ;
- écriture de tests d’intégration API ;
- écriture de tests front ciblés ;
- écriture de scénarios end-to-end ;
- exploitation des rapports de couverture ;
- compréhension de la qualité statique et des quality gates SonarQube ;
- capacité à relier les tests aux critères d’acceptation métier.

### Outils concernés
- Jest
- `@nestjs/testing`
- Supertest
- React Testing Library
- Playwright
- SonarQube

### Pourquoi ces compétences sont nécessaires
Le sujet impose :
- au moins deux types de tests ;
- l’intégration des tests dans le pipeline CI/CD ;
- le suivi de métriques qualité ;
- la démonstration de la fonctionnalité métier via des tests d’appels ou des tests d’acceptation.

### Niveau attendu
- **Lead Developer** : fort
- **Développeurs confirmés** : intermédiaire à fort
- **QA / automatisation** : fort

## 5.6 Compétences sécurité applicative

### Compétences attendues
- compréhension des risques liés à l’authentification et aux autorisations ;
- gestion des mots de passe hashés ;
- sécurisation des JWT ;
- séparation des routes publiques et privées ;
- validation stricte des entrées ;
- gestion sécurisée des fichiers téléversés ;
- protection des secrets ;
- exploitation de scans de vulnérabilités ;
- capacité à analyser des vulnérabilités et à proposer une remédiation.

### Pourquoi ces compétences sont nécessaires
Le contexte précise que l’application inclut des transactions financières et que la sécurité est une exigence de premier plan.

### Niveau attendu
- **Lead Developer** : fort
- **Développeur back** : fort
- **Développeur front** : intermédiaire
- **DevOps / Cloud** : intermédiaire à fort

## 5.7 Compétences CI/CD, cloud et exploitation

### Compétences attendues
- mise en place d’un pipeline GitHub Actions ;
- intégration du lint, build, tests, couverture, SonarQube et scan de vulnérabilités ;
- gestion des variables d’environnement et secrets ;
- déploiement d’un front Next.js sur une plateforme managée ;
- déploiement d’une API NestJS sur un service cloud managé ;
- usage d’une base PostgreSQL managée ;
- mise en place d’un smoke test ;
- gestion des environnements local, test et démo.

### Pourquoi ces compétences sont nécessaires
Le sujet impose :
- une chaîne CI/CD ;
- un déploiement sur cloud ou via orchestrateur ;
- des tests intégrés au pipeline ;
- une application démontrable ;
- une capacité de montée en charge observable.

### Niveau attendu
- **Lead Developer** : intermédiaire à fort
- **DevOps / Cloud** : fort
- **Développeurs confirmés** : intermédiaire

## 5.8 Compétences observabilité et diagnostic

### Compétences attendues
- configuration de logs structurés ;
- journalisation des actions sensibles ;
- lecture et exploitation des logs ;
- suivi des métriques HTTP minimales ;
- interprétation des résultats de tests de charge ;
- capacité à utiliser ces données dans un plan de remédiation.

### Pourquoi ces compétences sont nécessaires
Le sujet impose au moins une composante d’observabilité et demande une analyse des résultats de tests et des métriques collectées avant le plan de remédiation.

### Niveau attendu
- **Lead Developer** : intermédiaire à fort
- **Développeur back** : intermédiaire
- **DevOps / Cloud** : intermédiaire à fort
- **QA** : intermédiaire

## 6. Matrice synthétique des compétences par rôle

| Domaine de compétence | Lead Developer | Dev full-stack orienté back | Dev full-stack orienté front | QA / automatisation | DevOps / Cloud |
|---|---|---|---|---|---|
| Compréhension métier / backlog | Fort | Intermédiaire | Intermédiaire | Intermédiaire | Faible |
| Next.js / UI / formulaires | Intermédiaire à fort | Intermédiaire | Fort | Intermédiaire | Faible |
| NestJS / API / logique métier | Fort | Fort | Intermédiaire | Faible | Faible |
| Prisma / PostgreSQL / migrations | Intermédiaire à fort | Fort | Intermédiaire | Faible | Faible |
| Authentification / rôles / sécurité applicative | Fort | Fort | Intermédiaire | Faible | Intermédiaire |
| Tests unitaires / intégration / E2E | Fort | Intermédiaire à fort | Intermédiaire | Fort | Faible |
| SonarQube / qualité statique | Intermédiaire à fort | Intermédiaire | Intermédiaire | Intermédiaire | Intermédiaire |
| GitHub Actions / CI/CD | Intermédiaire à fort | Intermédiaire | Intermédiaire | Intermédiaire | Fort |
| Déploiement cloud / secrets / environnements | Intermédiaire | Intermédiaire | Faible | Faible | Fort |
| Logs / observabilité / charge | Intermédiaire à fort | Intermédiaire | Faible | Intermédiaire | Intermédiaire à fort |

## 7. Analyse des écarts de compétences

## 7.1 Points déjà couverts par l’équipe existante

Avec un lead developer et deux développeurs confirmés, l’équipe de départ peut raisonnablement couvrir :
- le développement applicatif front et back ;
- la conception d’API ;
- la modélisation de base de données ;
- l’implémentation du flux métier principal ;
- les tests unitaires et une partie des tests d’intégration ;
- la structuration du dépôt et du code.

## 7.2 Compétences les plus critiques à renforcer

Les domaines qui présentent le plus de risque sur ce projet sont :
- la mise en place complète du pipeline CI/CD ;
- l’analyse qualité SonarQube ;
- l’automatisation de tests plus avancés, notamment E2E ;
- l’exploitation cloud et la gestion propre des environnements ;
- l’observabilité ;
- la sécurité applicative avancée sur un contexte transactionnel.

## 7.3 Risques identifiés si ces compétences ne sont pas renforcées

Si l’équipe ne renforce pas ces compétences, les risques principaux sont :
- pipeline instable ou incomplet ;
- qualité statique suivie de manière superficielle ;
- tests insuffisants sur le parcours critique ;
- déploiement fragile ;
- faible capacité de diagnostic en cas d’erreur ;
- sécurité traitée trop tardivement ;
- difficulté à défendre l’architecture et les choix techniques lors de la soutenance.

## 8. Répartition proposée des responsabilités

## 8.1 Lead Developer
Responsabilités principales :
- cadrage technique ;
- choix d’architecture ;
- définition des métriques ;
- définition du pipeline CI/CD ;
- revue de code ;
- arbitrages de sécurité ;
- pilotage global de la qualité.

## 8.2 Développeur full-stack orienté back
Responsabilités principales :
- implémentation de l’API NestJS ;
- auth JWT, rôles, guards ;
- logique métier de création / validation d’annonce ;
- intégration Prisma / PostgreSQL ;
- tests unitaires et d’intégration back.

## 8.3 Développeur full-stack orienté front
Responsabilités principales :
- interface Next.js ;
- formulaires ;
- validations Zod ;
- catalogue public ;
- espace seller et espace admin ;
- tests de composants front.

## 8.4 Profil QA / automatisation
Responsabilités principales :
- formalisation des scénarios de test ;
- automatisation des tests de parcours critiques ;
- structuration des tests E2E ;
- aide à la lecture des rapports de couverture ;
- participation à la validation du backlog.

## 8.5 Profil DevOps / Cloud
Responsabilités principales :
- mise en place GitHub Actions ;
- intégration SonarQube ;
- intégration scan de vulnérabilités ;
- gestion des secrets et des variables d’environnement ;
- déploiement cloud ;
- smoke tests ;
- support observabilité.

## 9. Action de formation proposée

## 9.1 Intitulé
**Formation collective “Sécuriser et industrialiser une application NestJS / Next.js avec CI/CD, SonarQube et tests automatisés”**

## 9.2 Objectif de la formation
Renforcer rapidement les compétences de l’équipe sur les briques les plus critiques du projet :
- sécurité applicative ;
- pipeline CI/CD ;
- qualité statique ;
- stratégie de tests ;
- déploiement cloud ;
- observabilité minimale.

## 9.3 Public visé
- Lead Developer
- Développeurs confirmés
- profil QA / automatisation si disponible
- profil DevOps / Cloud si disponible

## 9.4 Pourquoi cette formation est prioritaire
La plus forte zone de risque du projet ne se situe pas dans le développement CRUD simple, mais dans l’industrialisation du prototype :
- sécuriser les accès ;
- fiabiliser le pipeline ;
- mesurer la qualité ;
- déployer proprement ;
- démontrer les tests et les métriques ;
- préparer le plan de remédiation.

Une formation ciblée sur ces éléments a donc plus de valeur qu’une formation générique sur JavaScript ou TypeScript.

## 9.5 Format proposé
- durée : **2 jours**
- format : atelier intensif mêlant apports ciblés et mise en pratique
- modalité : présentiel ou distanciel synchrone
- support : mini dépôt d’exercices + environnement de démonstration

## 9.6 Programme proposé

### Module 1 — Sécurité applicative sur NestJS
- JWT, rôles, guards
- bonnes pratiques d’authentification
- validation serveur
- gestion des erreurs
- stockage des secrets
- sécurisation des uploads

### Module 2 — Stratégie de tests
- tests unitaires avec Jest
- tests d’intégration API avec Supertest
- tests front ciblés
- tests E2E avec Playwright
- articulation avec les critères d’acceptation

### Module 3 — Qualité statique et dette technique
- lecture des indicateurs SonarQube
- quality gates
- duplication
- code smells
- usage des résultats pour orienter les corrections

### Module 4 — GitHub Actions et chaîne CI/CD
- structuration d’un workflow
- intégration lint / build / tests / couverture / SonarQube / scan vulnérabilités
- conditions de blocage
- secrets CI

### Module 5 — Déploiement et observabilité
- déploiement front et back sur plateformes managées
- variables d’environnement
- smoke tests
- logs structurés
- lecture des métriques minimales
- exploitation des résultats pour la remédiation

## 9.7 Résultats attendus de la formation
À l’issue de la formation, l’équipe doit être capable de :
- sécuriser correctement les accès du prototype ;
- produire un pipeline CI/CD cohérent et présentable ;
- exploiter SonarQube sans subir l’outil ;
- automatiser les tests du parcours critique ;
- déployer une version démontrable ;
- interpréter les premiers signaux issus des logs, métriques et tests.

## 9.8 Indicateurs de réussite de la formation
La formation sera considérée comme efficace si elle permet :
- la mise en place effective du pipeline défini ;
- l’automatisation d’au moins deux types de tests ;
- l’exploitation des quality gates SonarQube ;
- la mise en place d’un déploiement démo fonctionnel ;
- une meilleure autonomie de l’équipe sur la sécurité et le diagnostic.

## 10. Recommandation finale

Pour le projet Collector, la réussite ne dépend pas uniquement des compétences de développement applicatif. Elle dépend surtout de la capacité de l’équipe à combiner :
- développement full-stack ;
- sécurité applicative ;
- qualité logicielle ;
- automatisation des tests ;
- CI/CD ;
- déploiement cloud ;
- observabilité.

L’équipe existante constitue une base crédible pour démarrer, mais les compétences liées à l’industrialisation du prototype doivent être renforcées pour sécuriser la v1 et réussir la soutenance technique.

La formation proposée répond à ce besoin en visant les compétences les plus critiques sans disperser l’équipe sur des sujets secondaires.

## 11. Conclusion

La cartographie des compétences du projet Collector montre que le développement du prototype nécessite un socle de compétences varié couvrant :
- le métier de la marketplace ;
- le front-end Next.js ;
- le back-end NestJS ;
- la base de données ;
- les tests ;
- la sécurité ;
- le CI/CD ;
- le cloud ;
- l’observabilité.

Dans une logique réaliste de start-up, l’équipe existante peut porter le projet à condition de renforcer les compétences les plus critiques autour de la sécurisation, de l’automatisation et de l’industrialisation. La formation collective proposée constitue donc l’action la plus pertinente pour augmenter rapidement le niveau global de l’équipe et réduire les risques de livraison.