# 06 - Expérimentations techniques en bac à sable

## 1. Objectif du document

Avant de lancer le développement complet du prototype Collector, plusieurs expérimentations techniques ont été menées en bac à sable afin de valider l’intégration des technologies les plus structurantes du projet.

L’objectif de ces expérimentations est de :
- réduire le risque technique avant l’implémentation complète ;
- confirmer la compatibilité des outils avec l’architecture retenue ;
- identifier les limites et difficultés dès le début du projet ;
- justifier l’adoption ou le rejet de certaines solutions.

Cette démarche est conforme aux consignes, qui demandent de tester les technologies ou solutions techniques phares avant le développement, puis de documenter l’environnement de test, les étapes de reproduction, les difficultés rencontrées, les limites identifiées et les résultats permettant de justifier les choix finaux.

## 2. Rappel du périmètre expérimental retenu

Les expérimentations présentées ici portent uniquement sur des technologies critiques pour le prototype :
- la chaîne CI/CD et les outils qualité ;
- le système de sécurité et d’authentification ;
- le système d’observabilité ;
- le déploiement sur fournisseur cloud avec base de données managée.

Ces expérimentations sont considérées comme pertinentes car les consignes donnent explicitement comme exemples valides :
- une plateforme CI/CD intégrant des outils qualité et des frameworks de tests ;
- un système d’observabilité ;
- des services d’un fournisseur cloud ;
- un système de sécurité ou des composants d’infrastructure.

En revanche, les expérimentations suivantes n’ont pas été retenues car elles ne seraient pas considérées comme valides au regard des consignes :
- tester simplement TypeScript ou JavaScript ;
- tester uniquement la communication REST entre le front et le back ;
- exécuter des tests unitaires en local ;
- implémenter un simple endpoint avec un framework sans enjeu d’intégration.

## 3. Environnement d’expérimentation

L’environnement de test utilisé pour les expérimentations est le suivant :

### Poste de travail
- ordinateur portable sous Windows 11
- Node.js
- npm
- Git
- Docker Desktop pour les composants locaux nécessaires
- VS Code

### Environnement de code
- dépôt GitHub dédié au prototype
- branches de test pour chaque expérimentation
- variables d’environnement locales non versionnées

### Stack applicative cible
- front : Next.js + TypeScript
- back : NestJS + TypeScript
- base de données : PostgreSQL
- ORM : Prisma
- logs : Pino
- qualité : ESLint, Jest, Supertest, SonarQube
- CI/CD : GitHub Actions
- déploiement : plateforme front managée + service cloud managé pour l’API et la base

## 4. Synthèse des expérimentations réalisées

| Référence | Sujet | Type | Décision |
|---|---|---|---|
| EXP-01 | Pipeline CI/CD avec quality gate | Plateforme CI/CD | Adopté |
| EXP-02 | Authentification centralisée JWT et rôles | Système de sécurité | Adopté |
| EXP-03 | Auth.js / NextAuth comme solution principale d’auth | Solution alternative | Rejeté |
| EXP-04 | Observabilité minimale avec logs structurés | Système d’observabilité | Adopté |
| EXP-05 | Déploiement cloud avec API et PostgreSQL managés | Service fournisseur cloud | Adopté |

## 5. EXP-01 — Pipeline CI/CD avec quality gate

### 5.1 Objectif
Valider la faisabilité d’une chaîne CI/CD capable d’exécuter automatiquement les contrôles principaux attendus pour le prototype :
- lint ;
- build ;
- tests unitaires ;
- tests d’intégration ;
- couverture ;
- analyse SonarQube ;
- scan de vulnérabilités.

### 5.2 Justification du choix
Cette expérimentation est prioritaire car les consignes imposent :
- une chaîne CI/CD intégrant les principales étapes ;
- au minimum deux types de tests ;
- des outils permettant de suivre les métriques qualité ;
- une intégration de la sécurité dans le cycle de développement.

### 5.3 Environnement de test
- dépôt GitHub de test
- GitHub Actions
- projet Next.js minimal
- projet NestJS minimal
- Jest
- Supertest
- SonarQube
- scan de dépendances npm

### 5.4 Protocole d’expérimentation
1. Créer un dépôt de test avec un front et un back minimaux.
2. Ajouter les scripts `lint`, `build`, `test`, `test:cov` et `test:e2e`.
3. Mettre en place un workflow GitHub Actions déclenché sur push et pull request.
4. Exécuter successivement :
   - installation des dépendances ;
   - lint ;
   - build du front ;
   - build du back ;
   - tests unitaires ;
   - tests d’intégration API ;
   - rapport de couverture ;
   - analyse SonarQube ;
   - scan de vulnérabilités.
5. Introduire volontairement :
   - une erreur de lint ;
   - un test en échec ;
   - une règle SonarQube non respectée ;
   - une dépendance vulnérable ;
   afin de vérifier le comportement bloquant de la chaîne.

### 5.5 Résultats observés
- Le pipeline est capable de détecter correctement les erreurs de lint.
- Les builds front et back échouent immédiatement en cas d’erreur de compilation.
- Les tests unitaires et d’intégration sont exécutés sans difficulté particulière.
- Le rapport de couverture est exploitable pour suivre la métrique de couverture.
- L’analyse SonarQube permet bien de remonter :
  - duplications ;
  - code smells ;
  - note de maintenabilité ;
  - quality gate.
- Le scan de dépendances détecte correctement les vulnérabilités connues.

### 5.6 Difficultés rencontrées
- configuration initiale de SonarQube plus longue que prévu ;
- nécessité d’harmoniser les scripts npm entre le front et le back ;
- besoin de stabiliser la base de test pour les tests d’intégration ;
- nécessité de bien gérer les secrets GitHub Actions pour les outils externes.

### 5.7 Limites identifiées
- la configuration SonarQube ajoute une complexité de paramétrage ;
- les tests de charge ne sont pas intégrés au pipeline principal ;
- le déploiement peut rester optionnel dans le pipeline selon l’environnement choisi.

### 5.8 Décision
**Adopté**

### 5.9 Justification de la décision
Cette solution répond directement aux attentes du sujet et permet de suivre plusieurs métriques clés du projet :
- couverture de tests ;
- vulnérabilités ;
- qualité statique du code ;
- stabilité des builds.

Elle constitue donc une base solide pour la suite du prototype.

## 6. EXP-02 — Authentification centralisée JWT et rôles côté API

### 6.1 Objectif
Valider une solution de sécurité adaptée au prototype avec :
- authentification centralisée ;
- autorisation par rôles ;
- protection stricte des endpoints `seller` et `admin`.

### 6.2 Justification du choix
Le contexte Collector impose :
- des utilisateurs authentifiés pour acheter ou vendre ;
- un rôle `admin` pour le back-office ;
- un catalogue public accessible sans authentification ;
- une sécurité forte car l’application manipule des transactions financières.

### 6.3 Environnement de test
- API NestJS de test
- PostgreSQL de test
- Prisma
- stratégie JWT
- guards NestJS
- rôles `seller` et `admin`
- mots de passe hashés

### 6.4 Protocole d’expérimentation
1. Créer une API NestJS minimale avec un module d’authentification.
2. Créer deux utilisateurs de test :
   - un `seller`
   - un `admin`
3. Implémenter un endpoint de login retournant un JWT.
4. Protéger les endpoints suivants :
   - endpoint privé seller ;
   - endpoint privé admin ;
   - endpoint public catalogue.
5. Tester les cas suivants :
   - accès sans token ;
   - accès avec token seller sur route seller ;
   - accès avec token seller sur route admin ;
   - accès avec token admin sur route admin ;
   - accès public au catalogue sans authentification.
6. Déployer ensuite une version de test pour vérifier le comportement en HTTPS.

### 6.5 Résultats observés
- Les routes publiques restent accessibles sans authentification.
- Les routes privées refusent bien les requêtes sans token.
- Un `seller` authentifié ne peut pas appeler les endpoints admin.
- Un `admin` authentifié peut accéder aux fonctions d’administration.
- Le JWT centralisé côté API permet de garder une logique de sécurité unique.
- Le comportement reste cohérent une fois déployé.

### 6.6 Difficultés rencontrées
- nécessité de bien séparer authentification et autorisation ;
- risque initial de dupliquer des informations de rôle entre front et back ;
- nécessité d’anticiper le stockage du token côté front sans fragiliser la sécurité.

### 6.7 Limites identifiées
- ce prototype ne met pas en place d’authentification multi-facteurs ;
- la révocation avancée des tokens n’est pas traitée ;
- la gestion fine des sessions n’est pas poussée au-delà du besoin du POC.

### 6.8 Décision
**Adopté**

### 6.9 Justification de la décision
Cette solution est la plus cohérente avec l’architecture retenue :
- la sécurité est centralisée dans le back-end ;
- les rôles sont contrôlés au niveau de l’API ;
- le front reste simple et ne devient pas la source de vérité sur les autorisations ;
- la solution répond directement aux exigences du contexte Collector.

## 7. EXP-03 — Auth.js / NextAuth comme solution principale d’authentification

### 7.1 Objectif
Évaluer si une solution d’authentification portée principalement par le front Next.js est adaptée au prototype.

### 7.2 Justification du choix
Cette expérimentation a été menée car une solution de ce type peut sembler attractive pour accélérer le développement d’un front Next.js.

### 7.3 Environnement de test
- front Next.js de test
- intégration d’une solution d’authentification front
- API NestJS séparée
- simulation d’un utilisateur seller et d’un admin

### 7.4 Protocole d’expérimentation
1. Mettre en place une authentification pilotée principalement par le front.
2. Simuler une session utilisateur côté front.
3. Faire consommer l’API NestJS par le front authentifié.
4. Vérifier la propagation des rôles et la protection des routes côté API.
5. Comparer l’effort de mise en œuvre et la cohérence avec une authentification centralisée côté back.

### 7.5 Résultats observés
- La solution fonctionne pour des usages front simples.
- En revanche, la gestion combinée du front authentifié et d’une API métier séparée ajoute de la complexité.
- La logique d’authentification et la logique de rôles risquent d’être dupliquées entre le front et le back.
- Le modèle est moins lisible dans une architecture où l’API NestJS doit rester la source de vérité des autorisations.

### 7.6 Difficultés rencontrées
- complexité de synchronisation entre session front et sécurité API ;
- risque de multiplier les couches de logique d’authentification ;
- effort supplémentaire pour expliquer clairement l’architecture à l’oral.

### 7.7 Limites identifiées
- solution moins adaptée à une API métier déjà fortement structurée ;
- intérêt plus limité dans un prototype où la priorité est la clarté de l’architecture et la robustesse du contrôle d’accès.

### 7.8 Décision
**Rejeté comme solution principale**

### 7.9 Justification de la décision
La solution n’est pas retenue comme brique principale car elle complexifie inutilement le POC dans ce contexte. Une authentification centralisée par JWT côté NestJS est plus simple, plus lisible et mieux alignée avec l’architecture choisie.

## 8. EXP-04 — Observabilité minimale avec logs structurés

### 8.1 Objectif
Valider une solution d’observabilité minimale permettant :
- d’analyser les erreurs ;
- de suivre les actions sensibles ;
- de fournir des éléments mesurables pour la soutenance ;
- d’alimenter le plan de remédiation.

### 8.2 Justification du choix
Les consignes imposent la mise en place d’au moins une composante d’observabilité. Dans le cadre du prototype, les logs structurés représentent le meilleur compromis entre simplicité et valeur démonstrative.

### 8.3 Environnement de test
- API NestJS
- Pino
- middleware ou interceptor de journalisation
- endpoints d’authentification, création d’annonce et validation admin

### 8.4 Protocole d’expérimentation
1. Intégrer Pino dans l’API NestJS.
2. Configurer un format lisible en local et un format JSON pour l’environnement déployé.
3. Journaliser :
   - démarrage de l’application ;
   - erreurs applicatives ;
   - erreurs d’autorisation ;
   - création d’annonce ;
   - approbation ou rejet d’annonce.
4. Ajouter un identifiant de corrélation simple par requête si possible.
5. Générer plusieurs scénarios :
   - création d’annonce valide ;
   - erreur de validation ;
   - accès interdit sur route admin ;
   - approbation d’annonce.
6. Vérifier que les logs permettent de reconstituer correctement le comportement observé.

### 8.5 Résultats observés
- Les logs structurés sont exploitables pour analyser le comportement de l’API.
- Les refus d’autorisation sont visibles et distincts des erreurs applicatives.
- Les actions sensibles comme l’approbation d’annonce peuvent être tracées.
- La solution reste légère et simple à intégrer dans NestJS.

### 8.6 Difficultés rencontrées
- nécessité de choisir le bon niveau de verbosité ;
- nécessité d’éviter de journaliser des données sensibles ;
- besoin de conserver des logs compréhensibles à la fois localement et dans un environnement déployé.

### 8.7 Limites identifiées
- absence de centralisation avancée de logs à ce stade ;
- pas de traces distribuées complètes ;
- métriques encore limitées si aucun collecteur dédié n’est ajouté.

### 8.8 Décision
**Adopté**

### 8.9 Justification de la décision
Cette solution répond au besoin minimal d’observabilité du prototype :
- elle est rapide à intégrer ;
- elle aide à la démonstration ;
- elle facilite le diagnostic ;
- elle prépare le futur plan de remédiation.

## 9. EXP-05 — Déploiement cloud avec API et PostgreSQL managés

### 9.1 Objectif
Valider la faisabilité du déploiement du prototype sur des services cloud managés, sans infrastructure trop lourde.

### 9.2 Justification du choix
Les consignes imposent une gestion du déploiement via un orchestrateur ou un fournisseur cloud. Dans le cadre d’un prototype individuel, une plateforme managée est plus réaliste et plus efficace qu’une orchestration complexe.

### 9.3 Environnement de test
- front Next.js
- API NestJS
- base PostgreSQL managée
- variables d’environnement injectées par la plateforme
- exposition HTTPS automatique par le fournisseur

### 9.4 Protocole d’expérimentation
1. Déployer une version minimale du front sur une plateforme front managée.
2. Déployer une version minimale de l’API sur un service cloud managé.
3. Provisionner une base PostgreSQL managée.
4. Configurer les variables d’environnement :
   - URL de base ;
   - secret JWT ;
   - URL d’API ;
   - configuration de stockage.
5. Exécuter les migrations Prisma sur la base distante.
6. Vérifier :
   - la connectivité entre API et base ;
   - la disponibilité HTTPS ;
   - le bon fonctionnement des routes publiques ;
   - le bon fonctionnement de l’authentification.
7. Lancer un smoke test post-déploiement.

### 9.5 Résultats observés
- Le déploiement est faisable sans orchestrateur complexe.
- La base PostgreSQL managée simplifie fortement l’exploitation.
- Les variables d’environnement permettent de séparer proprement les secrets du code.
- L’exposition HTTPS est obtenue sans configuration trop lourde.
- Le prototype peut être rendu démontrable rapidement dans un environnement proche du réel.

### 9.6 Difficultés rencontrées
- configuration initiale des variables d’environnement ;
- synchronisation des URLs entre le front et l’API ;
- exécution correcte des migrations Prisma sur la base distante ;
- vigilance nécessaire sur les CORS et les URLs de callback.

### 9.7 Limites identifiées
- dépendance au fournisseur choisi ;
- environnement de démonstration moins flexible qu’une plateforme orchestrée complète ;
- supervision avancée limitée par rapport à une infrastructure plus mature.

### 9.8 Décision
**Adopté**

### 9.9 Justification de la décision
Cette solution est la plus adaptée au cadre du projet :
- elle répond aux consignes ;
- elle réduit la charge d’exploitation ;
- elle permet une démonstration crédible ;
- elle reste cohérente avec la taille et les objectifs du prototype.

## 10. Synthèse des décisions

Les expérimentations menées permettent de retenir les choix suivants pour la suite du projet :

- **CI/CD** : GitHub Actions avec quality gate, couverture, SonarQube et scan de vulnérabilités
- **sécurité** : authentification centralisée par JWT dans l’API NestJS avec rôles `seller` et `admin`
- **observabilité** : logs structurés avec Pino
- **déploiement** : plateformes cloud managées pour le front, l’API et la base PostgreSQL
- **solution rejetée** : Auth.js / NextAuth comme brique principale d’authentification

## 11. Impact sur l’architecture finale

Les expérimentations confirment que l’architecture finale du prototype doit reposer sur :
- un front Next.js responsable de l’interface utilisateur ;
- une API NestJS responsable de la logique métier, de l’authentification et des autorisations ;
- une base PostgreSQL managée ;
- une chaîne CI/CD automatisée ;
- une observabilité minimale mais exploitable ;
- un déploiement cloud simple à démontrer.

Elles confirment également qu’il est préférable de :
- centraliser la sécurité côté API ;
- éviter la duplication de logique d’authentification ;
- intégrer tôt les quality gates ;
- ne pas surcharger le prototype avec une infrastructure disproportionnée.

## 12. Conclusion

Les expérimentations techniques menées en bac à sable ont permis de sécuriser les principaux choix du prototype Collector avant le développement complet.

Elles ont montré que :
- la chaîne CI/CD retenue est faisable et utile pour piloter les métriques qualité ;
- l’authentification centralisée par JWT est plus adaptée que les alternatives testées ;
- les logs structurés constituent une base d’observabilité suffisante pour le prototype ;
- le déploiement sur services cloud managés est réaliste et cohérent avec le niveau attendu.

Ces résultats justifient les choix techniques retenus dans l’architecture finale et réduisent le risque de blocage pendant l’implémentation de la fonctionnalité métier.