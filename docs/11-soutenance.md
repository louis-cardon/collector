# 11 - Préparation de la soutenance technique

## 1. Objectif du document

Ce document prépare la soutenance technique du prototype Collector.  
Il a pour objectif de :
- structurer la présentation orale ;
- organiser l’ordre des preuves à montrer ;
- préparer la démonstration du prototype ;
- anticiper les questions du jury ;
- sécuriser la présentation avec un plan B.

La soutenance doit démontrer non seulement qu’une fonctionnalité métier a été implémentée, mais aussi que le projet a été piloté avec une démarche structurée intégrant :
- architecture ;
- qualité ;
- sécurité ;
- tests ;
- CI/CD ;
- observabilité ;
- déploiement ;
- analyse et remédiation.

## 2. Fil conducteur de la soutenance

Le fil conducteur retenu pour la présentation est le suivant :

1. rappeler brièvement le contexte métier ;
2. montrer le périmètre réellement retenu pour le POC ;
3. présenter l’architecture technique choisie ;
4. montrer comment la qualité et la sécurité sont intégrées au cycle de vie ;
5. démontrer le fonctionnement du flux métier principal ;
6. montrer les preuves de qualité : tests, couverture, SonarQube, scan de vulnérabilités ;
7. montrer les éléments d’observabilité et les résultats de charge ;
8. conclure avec l’analyse des risques et le plan de remédiation.

L’objectif est que la soutenance raconte une histoire cohérente :
- **voici le besoin** ;
- **voici ce que j’ai choisi de faire** ;
- **voici comment je l’ai construit** ;
- **voici les preuves que cela fonctionne** ;
- **voici les limites et comment je les corrigerais**.

## 3. Message principal à faire passer

Le message principal à faire passer pendant la soutenance est :

> Le prototype Collector démontre la faisabilité technique d’un flux métier central de la plateforme, dans une architecture web sécurisée, testée, déployée et pilotée par des métriques qualité.

Ce message doit rester visible tout au long de la présentation.  
Il faut éviter de donner l’impression :
- d’avoir développé beaucoup de choses mais sans preuve ;
- d’avoir fait une architecture théorique sans prototype réel ;
- d’avoir une démo qui marche sans démarche qualité ;
- d’avoir une démarche qualité sans vraie fonctionnalité métier.

## 4. Rappel du périmètre présenté

Le périmètre retenu pour la soutenance est volontairement limité au flux métier suivant :
- authentification ;
- création d’une annonce par un vendeur ;
- consultation des annonces en attente par un administrateur ;
- approbation ou rejet d’une annonce ;
- publication dans le catalogue public ;
- gestion des catégories par l’administrateur.

Les fonctionnalités hors périmètre sont notamment :
- paiement ;
- chat ;
- notifications ;
- détection de fraude ;
- recommandations ;
- internationalisation complète ;
- accessibilité avancée.

Il faudra rappeler explicitement ce choix au début pour montrer qu’il s’agit d’un **arbitrage volontaire** et non d’un oubli.

## 5. Répartition du temps recommandée

Pour une soutenance d’environ 20 minutes, la répartition recommandée est la suivante :

### 5.1 Introduction et contexte
**2 minutes**

### 5.2 Périmètre fonctionnel et backlog
**2 minutes**

### 5.3 Architecture technique
**3 minutes**

### 5.4 Démarche qualité, DevSecOps et CI/CD
**3 minutes**

### 5.5 Démonstration fonctionnelle
**4 minutes**

### 5.6 Résultats de tests, observabilité et charge
**3 minutes**

### 5.7 Analyse de sécurité et plan de remédiation
**2 minutes**

### 5.8 Conclusion
**1 minute**

## 6. Plan détaillé de présentation

## 6.1 Introduction

### Objectif
Poser le contexte rapidement et montrer que le sujet a été compris.

### Ce qu’il faut dire
- Collector est une marketplace d’objets de collection entre particuliers.
- Le contexte impose plusieurs rôles : visiteur, vendeur, administrateur.
- La sécurité est importante car l’application s’inscrit dans un contexte transactionnel.
- Le sujet ne demande pas d’implémenter tout le produit, mais de démontrer la faisabilité d’une fonctionnalité métier dans une démarche de qualité, sécurité et déploiement.

### Support conseillé
- 1 slide de contexte
- éventuellement un schéma très simple du produit cible

### Phrase possible
> Pour ce projet, j’ai choisi de me concentrer sur un flux métier central et structurant : la création d’annonce par un vendeur, sa validation par un administrateur, puis sa publication dans le catalogue public.

## 6.2 Périmètre fonctionnel retenu

### Objectif
Montrer que le périmètre est maîtrisé et cohérent.

### Ce qu’il faut dire
- le POC couvre le flux seller → admin → catalogue ;
- ce choix permet de couvrir :
  - authentification ;
  - rôles ;
  - logique métier ;
  - validation ;
  - persistance ;
  - sécurité ;
  - tests ;
  - déploiement ;
  - observabilité ;
- les autres fonctionnalités restent hors périmètre pour garder un prototype crédible et démontrable.

### Support conseillé
- slide avec le flux métier retenu
- slide avec le backlog priorisé

### Ce qu’il faut montrer
- 3 à 5 user stories max
- les statuts métier `PENDING_REVIEW`, `APPROVED`, `REJECTED`
- la gestion des catégories par l’administrateur ou son utilisation dans la création d’annonce

## 6.3 Architecture technique

### Objectif
Montrer que les choix techniques ne sont pas arbitraires.

### Ce qu’il faut dire
- front en Next.js ;
- back en NestJS ;
- PostgreSQL avec Prisma ;
- auth centralisée dans l’API avec JWT ;
- validation front avec Zod et validation back avec DTOs / ValidationPipe ;
- logs structurés avec Pino ;
- CI/CD avec GitHub Actions ;
- SonarQube pour la qualité statique ;
- déploiement sur plateformes cloud managées.

### Support conseillé
- 1 slide architecture logique
- 1 slide avec le schéma d’architecture

### Ce qu’il faut insister
- sécurité centralisée dans l’API ;
- séparation claire front / API / données ;
- architecture proportionnée au périmètre du prototype.

### Phrase possible
> J’ai volontairement évité une architecture trop lourde pour garder un système démontrable, tout en intégrant les briques attendues : sécurité, tests, observabilité et déploiement.

## 6.4 Démarche qualité, DevSecOps et CI/CD

### Objectif
Montrer que le projet n’a pas été mené “au feeling”.

### Ce qu’il faut dire
- quatre métriques qualité ont été définies ;
- elles couvrent :
  - couverture de tests ;
  - vulnérabilités critiques ou hautes ;
  - latence p95 ;
  - qualité statique et dette technique SonarQube ;
- la sécurité est intégrée dès le développement ;
- le pipeline exécute :
  - lint ;
  - build ;
  - tests unitaires ;
  - tests d’intégration ;
  - couverture ;
  - SonarQube ;
  - scan de vulnérabilités ;
  - déploiement ;
  - smoke test.

### Support conseillé
- slide métriques qualité
- slide pipeline CI/CD

### Ce qu’il faut montrer
- capture GitHub Actions
- capture SonarQube
- éventuellement quality gate

## 6.5 Démonstration fonctionnelle

### Objectif
Prouver que le prototype fonctionne réellement.

### Parcours recommandé
1. connexion vendeur ;
2. création d’une annonce ;
3. vérification que l’annonce n’est pas visible dans le catalogue public ;
4. connexion admin ;
5. consultation des annonces en attente ;
6. approbation de l’annonce ;
7. retour sur le catalogue public ;
8. vérification que l’annonce est maintenant visible.

### Ce qu’il faut commenter pendant la démo
- rôle du vendeur ;
- statut initial de l’annonce ;
- contrôle admin avant publication ;
- rôle du catalogue public ;
- séparation des droits.

### Conseils
- utiliser des données de démonstration propres ;
- préparer les comptes seller et admin à l’avance ;
- éviter de créer trop de contenu à l’écran ;
- avoir une annonce simple, lisible, avec une catégorie claire.

## 6.6 Résultats de tests et preuves de validation

### Objectif
Montrer que la démo n’est pas le seul élément de preuve.

### Ce qu’il faut dire
- les tests unitaires sécurisent la logique métier ;
- les tests d’intégration API sécurisent l’authentification, les rôles et les endpoints ;
- les tests E2E ou d’acceptation valident le parcours critique ;
- la couverture dépasse ou non l’objectif fixé ;
- les résultats servent à objectiver la qualité du prototype.

### Support conseillé
- slide synthèse des tests
- slide couverture
- slide exemples de scénarios critiques

### Ce qu’il faut montrer
- un résultat de test API ;
- un scénario E2E ;
- le rapport de couverture.

## 6.7 Observabilité et charge

### Objectif
Montrer que le comportement du système est mesurable.

### Ce qu’il faut dire
- des logs structurés sont produits ;
- les actions sensibles comme l’approbation admin sont tracées ;
- des métriques HTTP minimales sont suivies ;
- un test de charge a été réalisé sur les endpoints critiques.

### Ce qu’il faut montrer
- log de création d’annonce ;
- log d’approbation admin ;
- log de refus d’accès ;
- tableau ou capture des résultats de charge.

### Lecture attendue
- endpoint le plus sollicité ;
- latence p95 ;
- taux d’erreur ;
- commentaire sur les limites observées.

### Important
Le but n’est pas de prouver que l’application supporte une charge énorme, mais de montrer que :
- tu as mesuré ;
- tu sais lire les résultats ;
- tu sais en tirer des conclusions.

## 6.8 Analyse de sécurité et plan de remédiation

### Objectif
Montrer une vision critique du prototype.

### Ce qu’il faut dire
- la v1 est une base saine mais perfectible ;
- les principaux risques identifiés concernent :
  - autorisation ;
  - secrets et JWT ;
  - validation des entrées ;
  - uploads d’images ;
  - dépendances vulnérables ;
  - dette technique ;
  - charge ;
  - configuration cloud ;
- les actions sont priorisées en P1, P2, P3.

### Support conseillé
- slide “constats”
- slide “plan d’actions priorisé”

### Ce qu’il faut montrer
- 3 à 5 actions prioritaires maximum
- responsables et logique de priorisation

### Phrase possible
> L’objectif n’est pas de prétendre que le prototype est prêt pour une production complète, mais de montrer qu’il est piloté de manière réaliste, avec une analyse claire des risques et des actions de remédiation priorisées.

## 6.9 Conclusion

### Objectif
Terminer proprement en rappelant la valeur du travail.

### Ce qu’il faut dire
- le prototype démontre la faisabilité technique du flux métier choisi ;
- l’architecture est cohérente avec le contexte ;
- la qualité, la sécurité et le déploiement ont été intégrés dès le départ ;
- les résultats sont mesurés ;
- les risques sont identifiés et priorisés.

### Phrase possible
> Ce prototype montre donc une base technique cohérente, testée, sécurisée et évolutive pour la v1 de Collector, avec une démarche qualité exploitable pour la suite du projet.

## 7. Liste des preuves à préparer

## 7.1 Preuves fonctionnelles
- écran de login seller ;
- création d’annonce ;
- vue admin des annonces en attente ;
- approbation d’annonce ;
- catalogue public avant / après approbation ;
- gestion des catégories.
- création ou modification d’une catégorie par l’administrateur ;

## 7.2 Preuves techniques
- schéma d’architecture ;
- schéma du pipeline CI/CD ;
- capture Swagger / OpenAPI ;
- capture GitHub Actions ;
- capture SonarQube ;
- capture du scan de vulnérabilités.

## 7.3 Preuves qualité
- rapport de couverture ;
- exemple de test unitaire ;
- exemple de test d’intégration ;
- exemple de test E2E ou test d’acceptation.

## 7.4 Preuves observabilité et charge
- logs structurés ;
- audit admin ;
- résultats Siege ou JMeter ;
- lecture de la latence p95 et du taux d’erreur.

## 7.5 Preuves sécurité
- séparation seller / admin ;
- refus d’accès ;
- scan de vulnérabilités ;
- plan de remédiation priorisé.

## 8. Ordre recommandé des slides

1. Titre / contexte
2. Périmètre du POC
3. Backlog et flux métier retenu
4. Architecture technique
5. Choix technologiques
6. Métriques qualité
7. DevSecOps et pipeline CI/CD
8. Démonstration du parcours métier
9. Résultats de tests
10. SonarQube et scan de vulnérabilités
11. Observabilité et charge
12. Analyse de sécurité
13. Plan de remédiation
14. Conclusion

## 9. Déroulé de démo recommandé

### Préparation avant oral
- lancer les applications ;
- vérifier la base de démonstration ;
- vérifier les comptes seller et admin ;
- vérifier qu’une catégorie existe ;
- vérifier qu’aucune annonce parasite ne gêne la lecture ;
- ouvrir à l’avance :
  - l’application ;
  - Swagger si nécessaire ;
  - GitHub Actions ;
  - SonarQube ;
  - les logs ;
  - le résultat du test de charge.

### Démo
1. montrer le catalogue public ;
2. montrer qu’une annonce test n’est pas encore visible ;
3. se connecter en seller ;
4. créer l’annonce ;
5. montrer qu’elle n’est pas encore publique ;
6. se connecter en admin ;
7. approuver l’annonce ;
8. revenir sur le catalogue public ;
9. montrer qu’elle apparaît.

### Clôture de la démo
- montrer le log associé ;
- montrer un test API ou E2E ;
- montrer le pipeline ou SonarQube.

## 10. Plan B en cas de problème de démonstration

Il faut préparer un plan B complet.

### Éléments à avoir prêts
- captures d’écran du parcours complet ;
- capture du pipeline réussi ;
- capture SonarQube ;
- export ou capture des résultats de tests ;
- capture des logs ;
- capture des résultats de charge ;
- vidéo courte du parcours fonctionnel si autorisée.

### Message à adopter si la démo plante
- rester calme ;
- ne pas improviser une explication confuse ;
- basculer immédiatement sur les preuves préparées ;
- montrer que le problème n’empêche pas d’évaluer :
  - l’architecture ;
  - la qualité ;
  - les résultats ;
  - la logique métier.

### Phrase possible
> J’avais prévu un plan B de démonstration avec les captures et résultats du pipeline, ce qui me permet de montrer les preuves du fonctionnement même si l’environnement de démo a un comportement instable.

## 11. Questions probables du jury

### Pourquoi avoir limité le périmètre ?
Réponse attendue :
- pour garder un prototype crédible ;
- pour démontrer un flux métier complet ;
- pour couvrir qualité, sécurité, tests, déploiement et remédiation.

### Pourquoi NestJS et Next.js ?
Réponse attendue :
- cohérence avec une application web moderne ;
- bonne séparation front / API ;
- intégration simple avec tests, auth, validation et CI/CD.

### Pourquoi l’authentification est-elle gérée côté API ?
Réponse attendue :
- centralisation de la sécurité ;
- gestion claire des rôles ;
- limitation de la duplication de logique entre front et back.

### Pourquoi ces quatre métriques ?
Réponse attendue :
- elles couvrent les risques les plus importants du prototype :
  - régressions ;
  - sécurité ;
  - performance ;
  - dette technique.

### Pourquoi SonarQube ?
Réponse attendue :
- pour mesurer la maintenabilité, la duplication et les code smells ;
- pour relier la qualité statique à la dette technique.

### Quelles sont les principales limites du prototype ?
Réponse attendue :
- pas de paiement ;
- pas de chat ;
- pas de notifications ;
- pas de fraude ;
- observabilité et sécurité adaptées au niveau POC, pas à une prod complète.

### Quelles seraient les prochaines étapes ?
Réponse attendue :
- remédiation P1 ;
- durcissement sécurité ;
- enrichissement tests ;
- amélioration observabilité ;
- ajout progressif de nouvelles fonctionnalités métier.

## 12. Conseils de présentation

### À faire
- parler de façon structurée ;
- annoncer les parties ;
- montrer des preuves concrètes ;
- rester honnête sur les limites ;
- faire des transitions claires ;
- commenter les résultats plutôt que les lire.

### À éviter
- passer trop de temps sur le contexte ;
- montrer trop de code ;
- détailler tous les endpoints ;
- réciter les outils sans expliquer leur rôle ;
- noyer le jury dans des détails non démontrables ;
- prétendre qu’un prototype est déjà une production complète.

## 13. Checklist finale avant soutenance

### Documents
- cadrage prêt ;
- backlog prêt ;
- architecture prête ;
- métriques prêtes ;
- DevSecOps / CI-CD prêt ;
- expérimentations prêtes ;
- compétences / formation prêt ;
- stratégie de tests prête ;
- résultats prêts ;
- plan de remédiation prêt.

### Démo
- comptes fonctionnels ;
- données propres ;
- application accessible ;
- Swagger accessible ;
- pipeline visible ;
- SonarQube visible ;
- logs accessibles ;
- résultats de charge prêts.

### Plan B
- captures d’écran ;
- exports de tests ;
- captures pipeline ;
- captures SonarQube ;
- captures logs ;
- captures charge.

## 14. Conclusion

La soutenance doit montrer que le prototype Collector n’est pas seulement une démonstration fonctionnelle, mais un projet piloté avec une logique d’architecture, de qualité, de sécurité, de tests, de déploiement et de remédiation.

Si la présentation suit le fil proposé dans ce document, elle permettra de mettre en valeur :
- la cohérence du périmètre retenu ;
- la solidité des choix techniques ;
- la réalité des preuves de fonctionnement ;
- la maturité de l’analyse critique portée sur la v1 du prototype.