# 04 - Métriques qualité du POC Collector

## 1. Objectif

Dans le cadre du prototype Collector, l’objectif est de suivre un nombre réduit de métriques qualité afin de :
- vérifier que l’application respecte les exigences principales de qualité logicielle ;
- détecter rapidement les dérives techniques ;
- éviter l’accumulation de dette technique dans le temps ;
- alimenter les décisions de correction, d’amélioration et de remédiation.

Les consignes imposent l’identification de **quatre indicateurs ou métriques** permettant d’évaluer la conformité aux exigences de qualité, ainsi qu’une justification de leur utilité pour éviter l’accumulation de dette technique. Elles demandent également de montrer comment les outils du pipeline CI/CD permettent de suivre ces métriques.

## 2. Méthode de sélection

Les quatre métriques retenues ont été choisies pour couvrir les risques les plus importants dans le contexte de Collector.shop :
- sécurité élevée attendue car l’application manipule des transactions financières ;
- nécessité d’un flux métier fiable entre vendeur, administrateur et catalogue public ;
- besoin de maintenir une application testable et évolutive ;
- nécessité de démontrer un fonctionnement mesurable dans le pipeline CI/CD.

Les métriques retenues ne couvrent pas toute la norme ISO 25010, ce qui reste conforme aux consignes. Elles ciblent en priorité les dimensions les plus critiques pour le prototype : **fiabilité**, **maintenabilité**, **sécurité** et **performance**.

## 3. Métrique n°1 — Couverture de tests automatisés

### Intitulé
**Taux de couverture de code des tests automatisés**

### Exigences de qualité associées
- fiabilité
- maintenabilité
- capacité à limiter les régressions

### Définition
Cette métrique mesure la part du code exécutée par les tests automatisés, en particulier sur la logique métier critique du prototype.

### Formule
Couverture =  
(nombre d’instructions ou branches couvertes par les tests / nombre total d’instructions ou branches mesurables) × 100

### Périmètre retenu
Cette métrique s’applique en priorité :
- aux services NestJS contenant la logique métier ;
- aux règles de transition de statut des annonces ;
- aux contrôles d’autorisation ;
- aux endpoints critiques du flux principal.

### Objectif cible
- **au moins 80 %** de couverture sur le back-end ;
- priorité donnée à la logique métier et aux services critiques plutôt qu’à une couverture artificielle globale.

### Outils de mesure
- Jest
- couverture Jest
- tests unitaires back-end
- tests d’intégration API

### Pourquoi cette métrique est utile
La couverture de tests est un indicateur simple et lisible pour vérifier que les composants critiques du prototype sont effectivement vérifiés automatiquement.

Elle est particulièrement importante ici car les consignes imposent :
- un pipeline CI/CD intégrant des tests automatisés ;
- au moins deux types de tests ;
- une démonstration que la fonctionnalité métier implémentée est respectée.

### Lien avec la dette technique
Le suivi de la couverture permet d’éviter plusieurs formes de dette technique :
- ajout de code non testé ;
- augmentation du risque de régression lors des évolutions ;
- correction manuelle tardive de bugs qui auraient pu être détectés plus tôt ;
- perte de confiance dans les refactorings.

Cette métrique n’a pas vocation à garantir seule la qualité, mais elle force l’équipe à maintenir un socle minimal de vérification automatisée.

### Seuil d’alerte
- alerte si la couverture descend sous **75 %**
- blocage du pipeline si la couverture descend sous **70 %**

## 4. Métrique n°2 — Vulnérabilités critiques ou hautes

### Intitulé
**Nombre de vulnérabilités de sécurité critiques ou hautes détectées sur les dépendances et les composants livrés**

### Exigences de qualité associées
- sécurité
- fiabilité
- conformité minimale du processus de livraison

### Définition
Cette métrique mesure le nombre de vulnérabilités classées **High** ou **Critical** détectées dans les dépendances applicatives, et éventuellement dans les artefacts produits.

### Formule
Nombre de vulnérabilités =  
total des vulnérabilités classées `high` + `critical`

### Périmètre retenu
Cette métrique s’applique :
- aux dépendances npm du front Next.js ;
- aux dépendances npm du back NestJS ;
- aux artefacts déployables si un scan d’image ou d’artefact est ajouté.

### Objectif cible
- **0 vulnérabilité High**
- **0 vulnérabilité Critical**

### Outils de mesure
- npm audit ou équivalent
- scan de dépendances dans GitHub Actions
- éventuellement scan d’image de conteneur selon le mode de déploiement retenu

### Pourquoi cette métrique est utile
Collector.shop manipule des données liées à une plateforme marchande avec transactions financières, ce qui rend la sécurité particulièrement importante dans le contexte du projet.

Les consignes imposent d’ailleurs explicitement une solution de sécurité minimale incluant la détection des vulnérabilités et demandent ensuite une analyse de sécurité suivie d’un plan de remédiation.

### Lien avec la dette technique
Ne pas traiter tôt les vulnérabilités crée une dette technique de sécurité :
- dépendances obsolètes difficiles à mettre à jour plus tard ;
- accumulation de risques sur la chaîne logicielle ;
- corrections plus coûteuses lorsque l’application grossit ;
- baisse de confiance dans les livraisons.

Suivre cette métrique dès la phase de prototypage permet de conserver une base saine et de documenter les écarts acceptés ou refusés.

### Seuil d’alerte
- alerte à partir d’**1 vulnérabilité High**
- blocage du pipeline à partir d’**1 vulnérabilité Critical**
- blocage du pipeline sur la branche principale si une vulnérabilité **High** persiste sans justification formelle

## 5. Métrique n°3 — Latence des endpoints critiques

### Intitulé
**Latence p95 des endpoints critiques**

### Exigences de qualité associées
- performance
- expérience utilisateur
- capacité à supporter une montée en charge minimale

### Définition
Cette métrique mesure le temps de réponse observé sur les endpoints les plus importants, en retenant la latence au **95e percentile** afin de mieux représenter les cas dégradés qu’une simple moyenne.

### Endpoints critiques retenus
- `POST /auth/login`
- `POST /articles`
- `GET /admin/articles/pending`
- `POST /admin/articles/:id/approve`
- `GET /catalog`

### Formule
Latence p95 =  
temps de réponse en dessous duquel se situent 95 % des requêtes mesurées

### Objectif cible
- **p95 < 300 ms** sur les endpoints critiques dans des conditions normales d’utilisation du prototype
- tolérance plus élevée lors des tests de charge, avec analyse séparée

### Outils de mesure
- logs structurés
- métriques HTTP
- tests de charge avec Siege ou JMeter lors de la soutenance
- éventuellement métriques applicatives exposées par l’API

### Pourquoi cette métrique est utile
Les consignes demandent une composante d’observabilité et imposent une démonstration de montée en charge à l’oral.

Cette métrique permet donc de relier directement :
- le comportement réel de l’application ;
- les métriques observées ;
- l’analyse de performance ;
- les préconisations de remédiation.

### Lien avec la dette technique
Si la performance n’est pas suivie dès le départ, les lenteurs s’installent progressivement :
- requêtes de base de données mal conçues ;
- endpoints trop lourds ;
- erreurs de pagination ou de filtrage ;
- surcharge non anticipée sur les parcours critiques.

Suivre la latence p95 permet de détecter tôt ces dérives avant qu’elles deviennent structurelles.

### Seuil d’alerte
- alerte si le p95 dépasse **300 ms**
- alerte forte si le p95 dépasse **500 ms**
- remédiation prioritaire si les endpoints critiques dépassent régulièrement ces seuils

## 6. Métrique n°4 — Qualité statique du code et dette technique

### Intitulé
**Niveau de qualité statique du code mesuré par SonarQube**

### Exigences de qualité associées
- maintenabilité
- lisibilité
- maîtrise de la dette technique
- limitation des duplications et défauts de conception

### Définition
Cette métrique mesure la qualité statique du code à partir de l’analyse SonarQube. Elle s’appuie sur plusieurs indicateurs complémentaires :
- la **densité de duplication** ;
- le **nombre de code smells**, en particulier sur le nouveau code ;
- la **dette technique** estimée ;
- la **maintainability rating** ou note de maintenabilité.

### Périmètre retenu
Cette métrique s’applique :
- au front Next.js ;
- au back NestJS ;
- en priorité au **nouveau code** produit pendant le projet.

### Sous-indicateurs suivis
- **Duplicated lines density**
- **New code smells**
- **Technical debt / Technical debt ratio**
- **Maintainability rating**

### Objectifs cibles
- **densité de duplication < 3 % sur le nouveau code**
- **0 code smell critique ou blocker sur le nouveau code**
- **maintainability rating = A**
- **dette technique maîtrisée et justifiée lorsqu’un écart subsiste**

### Outils de mesure
- SonarQube
- analyse automatique dans GitHub Actions
- quality gate SonarQube

### Pourquoi cette métrique est utile
Une partie importante de la dette technique ne se voit pas immédiatement dans les tests fonctionnels. Elle apparaît plutôt sous la forme :
- de code dupliqué ;
- de méthodes trop complexes ;
- de conventions non respectées ;
- de défauts de conception qui rendent l’évolution plus coûteuse.

L’analyse statique permet donc de compléter les autres métriques en apportant une vision orientée maintenabilité du prototype.

### Lien avec la dette technique
Cette métrique est directement liée à la dette technique :
- la duplication rend les évolutions plus coûteuses et favorise les corrections partielles ;
- les code smells signalent des défauts de structure qui diminuent la lisibilité et la maintenabilité ;
- la dette technique estimée par SonarQube donne une mesure concrète de l’effort nécessaire pour corriger les problèmes détectés ;
- la note de maintenabilité synthétise la qualité globale du code sous l’angle de la maintenance future.

La suivre dès le prototype permet de garder une base de code propre avant que les défauts de structure ne s’accumulent.

### Seuils d’alerte
- alerte si la densité de duplication dépasse **3 %** sur le nouveau code ;
- alerte si de nouveaux code smells majeurs s’accumulent ;
- blocage du pipeline si la **quality gate SonarQube** échoue ;
- remédiation prioritaire si la note de maintenabilité descend sous **A** sur le nouveau code.

## 7. Synthèse des métriques retenues

| Métrique | Qualité principale | Cible | Outils principaux |
|---|---|---:|---|
| Couverture de tests automatisés | Fiabilité / Maintenabilité | ≥ 80 % | Jest, tests unitaires, tests d’intégration |
| Vulnérabilités High / Critical | Sécurité | 0 | npm audit, scan dépendances |
| Latence p95 endpoints critiques | Performance | < 300 ms | logs, métriques HTTP, Siege/JMeter |
| Qualité statique / dette technique | Maintenabilité | duplication < 3 %, rating A, quality gate OK | SonarQube |

## 8. Intégration dans le pipeline CI/CD

Le pipeline CI/CD devra permettre de mesurer ou d’alimenter directement ces quatre métriques :
- les tests unitaires et d’intégration alimentent la couverture ;
- le scan de dépendances alimente l’indicateur de vulnérabilités ;
- les métriques applicatives et les tests de charge alimentent la latence ;
- l’analyse SonarQube alimente la duplication, les code smells, la dette technique et la note de maintenabilité.

Ainsi, les métriques ne sont pas définies théoriquement : elles sont reliées aux outils réellement utilisés dans le projet et pourront être reprises dans la soutenance et dans le plan de remédiation.

## 9. Utilisation pour la suite du projet

Ces quatre métriques serviront ensuite à :
- définir les contrôles du pipeline CI/CD ;
- orienter la stratégie de tests ;
- alimenter l’observabilité minimale du prototype ;
- objectiver l’analyse de sécurité et le plan de remédiation ;
- surveiller l’apparition de dette technique structurelle dans le code.

Elles permettront aussi de justifier les arbitrages techniques réalisés pendant le développement, en montrant que les décisions ne reposent pas uniquement sur une intuition mais sur des indicateurs mesurables.

## 10. Conclusion

Les quatre métriques retenues pour le POC Collector sont :
1. la couverture de tests automatisés ;
2. le nombre de vulnérabilités critiques ou hautes ;
3. la latence p95 des endpoints critiques ;
4. la qualité statique du code et la dette technique mesurées par SonarQube.

Elles couvrent les dimensions les plus importantes du prototype : fiabilité, maintenabilité, sécurité et performance. Elles sont suffisamment concrètes pour être suivies dans les outils réellement utilisés par le projet et suffisamment utiles pour limiter l’accumulation de dette technique dès la première version.