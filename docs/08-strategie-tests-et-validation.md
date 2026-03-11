# 08 - Stratégie de tests et de validation du POC Collector

## 1. Objectif du document

Ce document définit la stratégie de tests et de validation du prototype Collector.  
Son objectif est de :
- garantir que la fonctionnalité métier retenue est correctement implémentée ;
- vérifier la conformité du prototype avec l’architecture et les choix techniques retenus ;
- intégrer les contrôles qualité dans la chaîne CI/CD ;
- fournir des preuves concrètes pour la soutenance et pour le plan de remédiation.

Cette stratégie est alignée avec les consignes de l’évaluation, qui demandent :
- l’intégration d’au moins **deux types de tests** dans le pipeline CI/CD ;
- une démonstration du respect de la fonctionnalité métier via des **tests d’appels** ou des **tests d’acceptation** ;
- l’exploitation des résultats de tests et des métriques dans la phase d’audit et de remédiation. 

## 2. Rappel du périmètre fonctionnel à valider

Le prototype retenu couvre le flux métier suivant :
- un vendeur authentifié crée une annonce ;
- l’annonce est enregistrée avec le statut `PENDING_REVIEW` ;
- un administrateur consulte les annonces en attente ;
- l’administrateur approuve ou rejette l’annonce ;
- les annonces approuvées deviennent visibles dans le catalogue public ;
- les catégories sont gérées par l’administrateur.

Ce périmètre est cohérent avec le contexte Collector, qui prévoit :
- un catalogue public consultable sans authentification ;
- des espaces authentifiés pour vendre et administrer ;
- des catégories gérées par l’admin ;
- des articles avec photos, description, prix et frais de port ;
- un contrôle avant publication. 

## 3. Principes de la stratégie de tests

La stratégie de tests repose sur les principes suivants :
- tester d’abord le **parcours métier critique** du POC ;
- combiner plusieurs niveaux de tests pour éviter les angles morts ;
- automatiser les tests les plus rentables dans le pipeline CI/CD ;
- vérifier la sécurité applicative au travers des scénarios de test ;
- produire des résultats lisibles et exploitables pour la soutenance ;
- limiter les tests “cosmétiques” peu utiles dans le cadre du prototype.

Les tests retenus ne cherchent donc pas à couvrir exhaustivement toutes les fonctionnalités imaginables de Collector.shop. Ils se concentrent sur le flux central réellement implémenté.

## 4. Objectifs de validation

La stratégie de validation vise à répondre à quatre objectifs principaux :

### 4.1 Validation fonctionnelle
Vérifier que le prototype respecte les user stories et les critères d’acceptation du backlog.

### 4.2 Validation technique
Vérifier que les composants respectent l’architecture, les contrats d’API et les règles de persistance.

### 4.3 Validation sécurité
Vérifier que les accès, rôles et protections minimales sont correctement appliqués.

### 4.4 Validation qualité
Vérifier que le projet reste compatible avec les métriques retenues :
- couverture de tests ;
- vulnérabilités critiques ou hautes ;
- latence p95 des endpoints critiques ;
- qualité statique du code et dette technique. 

## 5. Périmètre des tests

## 5.1 Ce qui est inclus

Sont inclus dans la stratégie de tests :
- authentification ;
- autorisation par rôles ;
- création d’annonce ;
- gestion des catégories ;
- consultation admin des annonces en attente ;
- approbation / rejet ;
- consultation du catalogue public ;
- validations de données ;
- comportement minimal du front sur les parcours critiques ;
- comportement du système sous charge sur quelques endpoints clés.

## 5.2 Ce qui n’est pas inclus

Ne sont pas inclus dans la couverture prioritaire du prototype :
- paiement en ligne ;
- chat vendeur / acheteur ;
- notifications ;
- détection de fraude ;
- recommandations ;
- internationalisation complète ;
- accessibilité avancée ;
- performance exhaustive à grande échelle.

Ces éléments restent hors périmètre du POC actuel, même s’ils existent dans le contexte global de Collector. 

## 6. Niveaux de tests retenus

La stratégie de tests repose sur cinq niveaux complémentaires.

## 6.1 Tests unitaires back-end

### Objectif
Vérifier la logique métier de manière isolée.

### Périmètre
- services NestJS ;
- règles de transition de statut ;
- validations métier ;
- règles d’autorisation métier non purement techniques.

### Outils
- Jest
- `@nestjs/testing`

### Valeur
Ces tests permettent de détecter rapidement les régressions sur le cœur métier sans nécessiter tout l’environnement applicatif.

## 6.2 Tests d’intégration API

### Objectif
Vérifier le comportement réel des endpoints REST avec authentification, autorisation, validation et persistance.

### Périmètre
- login ;
- création d’annonce ;
- consultation admin des annonces en attente ;
- approbation d’annonce ;
- consultation du catalogue public ;
- gestion des catégories.

### Outils
- Jest
- `@nestjs/testing`
- Supertest
- PostgreSQL de test isolée

### Valeur
Ces tests sont centraux dans le projet car ils valident réellement le flux métier côté serveur et peuvent servir de preuve directe du respect de la fonctionnalité métier implémentée. Ils répondent particulièrement bien à l’exigence de tests d’appels demandée dans les consignes.

## 6.3 Tests unitaires front

### Objectif
Vérifier quelques composants critiques de l’interface.

### Périmètre
- formulaires de création ;
- validations d’interface ;
- affichages conditionnels selon le rôle ou le statut ;
- composants liés aux catégories.

### Outils
- Jest
- React Testing Library

### Valeur
Ces tests sont utiles mais restent secondaires par rapport aux tests API et E2E dans le cadre de l’évaluation.

## 6.4 Tests end-to-end / tests d’acceptation

### Objectif
Vérifier le parcours utilisateur complet de bout en bout.

### Périmètre
- connexion vendeur ;
- création d’annonce ;
- connexion admin ;
- approbation d’annonce ;
- visibilité de l’annonce dans le catalogue public.

### Outils
- Playwright

### Valeur
Ces tests sont les plus lisibles pour démontrer que le backlog est respecté du point de vue utilisateur. Ils répondent directement à la possibilité mentionnée dans les consignes de présenter la conformité de la fonctionnalité via des tests d’acceptation.

## 6.5 Tests de charge

### Objectif
Observer le comportement du prototype sous montée en charge sur les endpoints critiques.

### Périmètre
- `GET /catalog`
- `POST /auth/login`
- `POST /articles` si le temps le permet

### Outils
- Siege ou JMeter

### Valeur
Ces tests servent principalement à la soutenance, à l’observabilité et au plan de remédiation. Les consignes demandent explicitement une démonstration de montée en charge lors de la présentation.

## 7. Répartition des tests par objectif

| Niveau de test | Objectif principal | Automatisé | Intégré au pipeline |
|---|---|---|---|
| Tests unitaires back | Fiabilité de la logique métier | Oui | Oui |
| Tests d’intégration API | Conformité fonctionnelle et sécurité serveur | Oui | Oui |
| Tests unitaires front | Fiabilité de composants critiques | Oui | Oui |
| Tests E2E / acceptation | Validation du parcours métier complet | Oui | Oui ou exécution dédiée |
| Tests de charge | Performance / remédiation / soutenance | Oui | Optionnel hors pipeline principal |

## 8. Politique de tests par composant

## 8.1 Front Next.js
Le front sera testé principalement sur :
- les formulaires critiques ;
- les validations côté interface ;
- les rendus conditionnels ;
- les redirections ou protections d’accès simples.

Le front ne porte pas la logique de sécurité métier finale. La validation définitive des droits reste donc testée prioritairement au niveau API.

## 8.2 API NestJS
L’API sera le composant le plus testé du projet, car elle porte :
- l’authentification ;
- les autorisations ;
- la logique métier ;
- les validations serveur ;
- les accès à la base ;
- la publication dans le catalogue.

## 8.3 Base de données et persistance
La persistance sera validée indirectement par :
- les tests d’intégration API ;
- les vérifications de statut ;
- les associations entre annonces, catégories, images et utilisateurs.

## 9. Jeux de tests prioritaires

## 9.1 Scénarios critiques à automatiser

Les scénarios critiques retenus sont :

### SCN-01 — Login seller
- un vendeur valide peut se connecter ;
- un JWT valide est obtenu ;
- un utilisateur non authentifié ne peut pas accéder aux routes seller.

### SCN-02 — Création d’annonce seller
- un seller authentifié crée une annonce complète ;
- l’annonce est enregistrée avec le statut `PENDING_REVIEW` ;
- l’annonce n’est pas visible publiquement.

### SCN-03 — Consultation admin des annonces en attente
- un admin authentifié consulte les annonces `PENDING_REVIEW` ;
- un seller ne peut pas accéder à cette liste.

### SCN-04 — Approbation admin
- un admin approuve une annonce ;
- le statut passe à `APPROVED` ;
- la date de revue et l’identifiant de l’admin sont conservés ;
- l’action est journalisée.

### SCN-05 — Rejet admin
- un admin rejette une annonce ;
- le statut passe à `REJECTED` ;
- l’annonce n’apparaît pas dans le catalogue public.

### SCN-06 — Visibilité dans le catalogue public
- une annonce approuvée devient visible ;
- une annonce en attente ou rejetée n’est pas visible ;
- le catalogue reste accessible sans authentification.

### SCN-07 — Gestion des catégories
- un admin crée une catégorie ;
- un seller peut utiliser une catégorie existante ;
- une catégorie inexistante est refusée à la création d’annonce.

## 9.2 Cas d’erreur à automatiser

Les cas d’erreur prioritaires sont :
- login invalide ;
- token absent ;
- token invalide ;
- seller tentant d’accéder à une route admin ;
- création d’annonce avec champ obligatoire manquant ;
- création d’annonce avec catégorie inexistante ;
- tentative de republication non autorisée ;
- annonce déjà approuvée retraitée sans droit ou sans logique prévue.

## 10. Cas de tests par type

## 10.1 Exemples de tests unitaires back

### ArticleService
- création d’annonce avec statut initial `PENDING_REVIEW`
- refus d’une création si les données minimales sont invalides
- transition `PENDING_REVIEW -> APPROVED`
- transition `PENDING_REVIEW -> REJECTED`
- refus d’une transition invalide

### Authorization / règles métier
- un seller ne peut pas approuver
- un admin peut approuver
- une annonce ne peut pas être visible si non approuvée

## 10.2 Exemples de tests d’intégration API

### Auth
- `POST /auth/login` retourne 200 avec identifiants valides
- `POST /auth/login` retourne 401 avec identifiants invalides

### Articles
- `POST /articles` retourne 201 pour un seller authentifié
- `POST /articles` retourne 401 sans authentification
- `POST /articles` retourne 400 si les données sont invalides

### Admin
- `GET /admin/articles/pending` retourne 200 pour admin
- `GET /admin/articles/pending` retourne 403 pour seller
- `POST /admin/articles/:id/approve` retourne 200 pour admin
- `POST /admin/articles/:id/approve` retourne 403 pour seller

### Catalogue
- `GET /catalog` retourne uniquement les annonces `APPROVED`
- `GET /catalog` reste accessible sans authentification

## 10.3 Exemples de tests front

- affichage des erreurs de validation sur le formulaire de création d’annonce ;
- désactivation du bouton d’envoi si le formulaire est invalide ;
- affichage conditionnel du statut d’une annonce ;
- affichage de la liste des catégories.

## 10.4 Exemples de tests E2E

### E2E-01 — Seller crée une annonce puis admin l’approuve
1. login seller
2. création d’annonce
3. login admin
4. approbation de l’annonce
5. vérification du succès de l’opération

### E2E-02 — Une annonce approuvée devient visible dans le catalogue
1. préparation d’une annonce approuvée
2. accès au catalogue public
3. vérification de la présence de l’annonce

## 11. Données de test

Les données de test nécessaires sont :

### Utilisateurs
- 1 compte `seller`
- 1 compte `admin`
- éventuellement 1 compte sans privilège particulier pour les cas négatifs

### Catégories
- au moins 2 catégories valides
- 1 catégorie inexistante pour les tests d’erreur

### Annonces
- 1 annonce `PENDING_REVIEW`
- 1 annonce `APPROVED`
- 1 annonce `REJECTED`

### Images
- au moins 1 image valide de test pour la création d’annonce

Les données de test doivent être isolées pour éviter de dépendre d’un état manuel de la base.

## 12. Environnements de test

## 12.1 Local développeur
Utilisé pour :
- exécuter rapidement les tests unitaires ;
- déboguer les tests d’intégration ;
- préparer les scénarios E2E.

## 12.2 Environnement CI
Utilisé pour :
- lancer automatiquement les tests sur chaque push / pull request ;
- produire les rapports de couverture ;
- alimenter SonarQube ;
- valider les critères de fusion.

## 12.3 Environnement déployé de démonstration
Utilisé pour :
- exécuter les smoke tests ;
- vérifier les parcours critiques ;
- lancer les tests de charge ;
- préparer la soutenance.

## 13. Critères d’entrée et de sortie des tests

## 13.1 Critères d’entrée
Avant exécution des tests, les éléments suivants doivent être prêts :
- backlog stabilisé ;
- architecture validée ;
- environnement de test disponible ;
- base de test initialisée ;
- données minimales de référence disponibles ;
- endpoints documentés ;
- règles métier du flux critique clarifiées.

## 13.2 Critères de sortie
Une version est considérée comme testée de manière satisfaisante si :
- les tests unitaires back passent ;
- les tests d’intégration API passent ;
- les tests front critiques passent ;
- les scénarios E2E critiques passent ;
- la couverture reste au-dessus du seuil fixé ;
- aucun échec critique de sécurité n’est constaté ;
- les résultats sont exploitables dans le pipeline et dans la soutenance.

## 14. Intégration dans le pipeline CI/CD

Le pipeline CI/CD intégrera au minimum :
1. installation des dépendances ;
2. lint ;
3. build ;
4. tests unitaires back ;
5. tests d’intégration API ;
6. tests unitaires front ;
7. couverture ;
8. SonarQube ;
9. scan de vulnérabilités ;
10. éventuellement exécution dédiée des tests E2E.

Cette organisation est conforme aux consignes qui imposent au moins deux types de tests intégrés au pipeline et demandent de montrer comment ces outils soutiennent les métriques qualité. 

## 15. Lien avec les métriques qualité

## 15.1 Couverture de tests automatisés
Les tests unitaires et d’intégration alimentent directement la métrique de couverture.

## 15.2 Vulnérabilités High / Critical
Les tests n’alimentent pas directement cette métrique, mais la stratégie de validation inclut des scénarios de sécurité et complète le scan de dépendances.

## 15.3 Latence p95 des endpoints critiques
Les tests de charge et les mesures d’observabilité permettent d’alimenter cette métrique.

## 15.4 Qualité statique / dette technique
SonarQube complète la stratégie de validation en contrôlant la maintenabilité, la duplication et les code smells.

## 16. Politique de blocage

Les règles de blocage proposées sont :
- échec si les tests unitaires back échouent ;
- échec si les tests d’intégration API échouent ;
- échec si les tests front critiques échouent ;
- échec si la couverture passe sous le seuil minimal ;
- échec si la quality gate SonarQube échoue ;
- échec si une vulnérabilité critique est détectée ;
- échec sur la branche principale si une vulnérabilité haute persiste sans justification formelle ;
- refus de fusion si un scénario critique du parcours principal n’est plus conforme.

## 17. Validation pour la soutenance

Pour la soutenance, la validation du prototype devra s’appuyer sur :
- des résultats de tests d’intégration API ;
- au moins un test d’acceptation ou E2E sur le parcours critique ;
- des captures ou exports des rapports de couverture ;
- les résultats SonarQube ;
- les résultats du scan de vulnérabilités ;
- les résultats des tests de charge ;
- des logs illustrant la création et l’approbation d’une annonce.

Cela permettra de démontrer à la fois :
- la conformité fonctionnelle ;
- la sécurité minimale ;
- la qualité logicielle ;
- le caractère démontrable du prototype. 

## 18. Limites de la stratégie

Cette stratégie est volontairement ciblée sur la v1 du prototype :
- elle ne couvre pas toutes les fonctionnalités du contexte Collector ;
- elle ne vise pas une couverture exhaustive du front ;
- elle ne remplace pas un plan de test industriel complet ;
- les tests de charge restent limités à quelques endpoints clés ;
- la sécurité est validée à un niveau adapté au prototype, pas à un niveau d’audit complet de production.

Ces limites sont assumées, car l’évaluation porte sur un POC technique individuel et non sur une mise en production exhaustive. 

## 19. Conclusion

La stratégie de tests du prototype Collector repose sur plusieurs niveaux complémentaires :
- tests unitaires back ;
- tests d’intégration API ;
- tests unitaires front ciblés ;
- tests E2E / d’acceptation ;
- tests de charge.

Cette approche permet de sécuriser le parcours métier principal, d’alimenter les métriques qualité, de soutenir le pipeline CI/CD et de préparer les preuves attendues pour la soutenance et le plan de remédiation.