# 10 - Plan de remédiation sécurité du prototype Collector

## 1. Objectif du document

Ce document présente le plan de remédiation sécurité du prototype Collector.

Il a pour objectif de :
- analyser les résultats obtenus sur la version 1 du prototype ;
- identifier les vulnérabilités potentielles à partir des tests, des métriques et de la connaissance de l’application ;
- proposer des actions de remédiation adaptées au contexte du projet ;
- prioriser ces actions pour guider l’évolution de la v1 vers une version plus robuste.

Le plan de remédiation s’appuie sur :
- les résultats des tests automatisés ;
- les résultats des scans de vulnérabilités ;
- les résultats SonarQube ;
- les éléments d’observabilité ;
- les résultats des tests de charge ;
- les caractéristiques métier du projet Collector.

## 2. Contexte de sécurité du projet

Le contexte Collector impose un niveau d’exigence élevé sur la sécurité, car l’application s’inscrit dans un domaine transactionnel et manipule des données liées à des opérations de vente en ligne.

Même si le prototype ne couvre qu’un sous-ensemble fonctionnel, il met déjà en œuvre plusieurs éléments sensibles :
- authentification des utilisateurs ;
- séparation des rôles `seller` et `admin` ;
- création et validation d’annonces ;
- publication d’articles dans un catalogue public ;
- téléversement d’images ;
- journalisation d’actions d’administration.

Le contexte métier impose également :
- un catalogue public accessible sans authentification ;
- des espaces authentifiés ;
- un rôle admin de back-office ;
- un contrôle des annonces avant publication ;
- une sécurité forte car l’application cible un environnement avec transactions financières.

## 3. Périmètre du plan de remédiation

Le présent plan de remédiation porte sur la version 1 du prototype et sur le périmètre réellement implémenté :
- authentification ;
- autorisation seller / admin ;
- création d’annonce ;
- gestion des catégories ;
- validation ou rejet des annonces ;
- consultation du catalogue public ;
- déploiement cloud du front, du back et de la base ;
- logs structurés, audit et tests de charge.

Les fonctionnalités non implémentées dans le prototype, comme le paiement, le chat, la notification ou la fraude, ne sont pas traitées ici de manière détaillée. Elles pourront en revanche être prises en compte dans une feuille de route de sécurité pour les versions ultérieures.

## 4. Sources d’analyse utilisées

L’analyse de sécurité présentée dans ce document s’appuie sur les éléments suivants :
- résultats des tests unitaires ;
- résultats des tests d’intégration API ;
- résultats des tests E2E / d’acceptation ;
- couverture de tests ;
- résultats SonarQube ;
- scan de vulnérabilités des dépendances ;
- logs applicatifs ;
- audit des actions d’administration ;
- métriques HTTP ;
- résultats des tests de charge.

Ces éléments ont été consolidés dans le document `09-resultats-tests-charge-observabilite.md`.

## 5. Méthode d’analyse retenue

La méthode retenue repose sur quatre étapes :

1. identifier les écarts observés dans les résultats de tests, d’analyse statique, de scans de sécurité et de charge ;
2. relier ces écarts à des vulnérabilités ou faiblesses potentielles du système ;
3. évaluer le risque selon :
   - l’impact métier ;
   - l’impact sécurité ;
   - la probabilité d’occurrence ;
   - la facilité d’exploitation ;
4. proposer des actions de remédiation priorisées et justifiées.

Cette approche permet de ne pas proposer des recommandations théoriques génériques, mais des mesures adaptées au prototype et à son contexte réel.

## 6. Échelle de priorisation

Les actions de remédiation sont classées selon trois niveaux de priorité :

### Priorité 1 — Critique
Action à mettre en œuvre rapidement avant toute ouverture plus large de la plateforme ou avant l’ajout de fonctionnalités sensibles supplémentaires.

### Priorité 2 — Importante
Action à mettre en œuvre à court terme pour renforcer la robustesse et réduire les risques d’exploitation ou de dérive technique.

### Priorité 3 — Amélioration
Action utile mais non bloquante pour le niveau actuel du prototype. Elle vise surtout à préparer l’industrialisation ou la montée en maturité de la plateforme.

## 7. Constats principaux issus de la v1

Les constats suivants sont à adapter aux résultats réels du document 09.

### 7.1 Conformité fonctionnelle
Le flux principal seller → validation admin → catalogue public est :
- `[conforme / partiellement conforme / non conforme]`

### 7.2 Sécurité des accès
La séparation entre routes publiques, seller et admin est :
- `[correcte / partielle / à renforcer]`

### 7.3 Qualité statique
La qualité statique du code est :
- `[satisfaisante / moyenne / insuffisante]`
sur la base de :
- duplication ;
- code smells ;
- maintainability rating ;
- quality gate SonarQube.

### 7.4 Dépendances et vulnérabilités connues
Le niveau de sécurité des dépendances est :
- `[satisfaisant / partiellement satisfaisant / insuffisant]`
au regard des vulnérabilités remontées par les scans.

### 7.5 Observabilité
Les logs et l’audit sont :
- `[suffisants / partiels / insuffisants]`
pour expliquer les comportements importants de l’application.

### 7.6 Performance et charge
Le comportement sous charge est :
- `[acceptable / à surveiller / insuffisant]`
sur les endpoints critiques, notamment :
- `GET /catalog`
- `POST /auth/login`
- `POST /articles`

## 8. Vulnérabilités et faiblesses potentielles identifiées

## 8.1 Risques liés à l’authentification et à l’autorisation

### Vulnérabilité potentielle
Mauvais cloisonnement entre les routes publiques, seller et admin, ou contrôle incomplet des rôles uniquement côté interface.

### Symptômes possibles
- tests d’intégration d’autorisation en échec ;
- accès non conforme à une route admin ;
- incohérence entre le comportement du front et celui de l’API ;
- logique d’autorisation répartie à plusieurs endroits.

### Risques
- accès non autorisé à des fonctions sensibles ;
- approbation ou modification d’annonces par un acteur non légitime ;
- exposition de données d’administration.

### Niveau de priorité
**Priorité 1**

### Remédiations proposées
- centraliser tous les contrôles d’autorisation côté API ;
- vérifier systématiquement les rôles avec des guards serveur ;
- limiter au front le simple masquage d’interface sans lui confier la décision de sécurité ;
- ajouter des tests d’intégration négatifs sur toutes les routes sensibles ;
- journaliser explicitement les refus d’accès.

### Justification
Le prototype repose sur plusieurs rôles et sur des actions d’administration sensibles. Une faiblesse sur l’autorisation a un impact direct sur l’intégrité de la plateforme.

## 8.2 Risques liés à la gestion du JWT et des secrets

### Vulnérabilité potentielle
Mauvaise gestion du secret JWT, durée de vie inadaptée des tokens, absence de rotation ou stockage non maîtrisé des secrets.

### Symptômes possibles
- secret JWT trop simple ;
- secret partagé entre plusieurs environnements ;
- configuration sensible présente dans le dépôt ;
- tokens valides trop longtemps sans stratégie claire.

### Risques
- compromission des sessions ;
- usurpation d’identité ;
- difficulté à invalider proprement des accès compromis.

### Niveau de priorité
**Priorité 1**

### Remédiations proposées
- utiliser un secret robuste et distinct par environnement ;
- stocker tous les secrets hors dépôt ;
- documenter la durée de vie des tokens et la stratégie de renouvellement ;
- prévoir la rotation des secrets ;
- ajouter des vérifications automatiques empêchant la présence de secrets dans le code source.

### Justification
Même dans un prototype, la gestion des accès est une brique critique. Une mauvaise gestion des secrets dégrade fortement la confiance dans tout le système.

## 8.3 Risques liés à la validation des entrées

### Vulnérabilité potentielle
Validation partielle ou incomplète des données envoyées à l’API, notamment sur :
- les champs de création d’annonce ;
- les catégories ;
- les paramètres transmis à des routes admin.

### Symptômes possibles
- tests d’intégration retournant des résultats incohérents ;
- différences entre validation front et validation back ;
- erreurs applicatives sur données inattendues.

### Risques
- enregistrement de données invalides ;
- incohérences métier ;
- augmentation du risque d’abus ou de contournement.

### Niveau de priorité
**Priorité 1**

### Remédiations proposées
- maintenir une validation systématique côté API avec DTOs et ValidationPipe ;
- vérifier les règles métier critiques côté service et pas seulement dans les DTOs ;
- harmoniser les validations front et back ;
- ajouter des cas de tests négatifs sur les payloads invalides ;
- limiter strictement les champs acceptés.

### Justification
Le flux métier du prototype dépend fortement de l’intégrité des données saisies et du statut des annonces.

## 8.4 Risques liés aux images et aux fichiers téléversés

### Vulnérabilité potentielle
Absence de contrôle strict sur les fichiers liés aux annonces.

### Symptômes possibles
- formats non maîtrisés ;
- taille non limitée ;
- métadonnées ou contenu non contrôlé ;
- stockage trop permissif.

### Risques
- surcharge du système ;
- exposition de contenus non conformes ;
- surface d’attaque supplémentaire sur le stockage.

### Niveau de priorité
**Priorité 2**

### Remédiations proposées
- limiter les types MIME et extensions autorisés ;
- limiter la taille maximale par fichier ;
- limiter le nombre d’images par annonce ;
- stocker les fichiers dans un espace dédié ;
- séparer clairement les métadonnées stockées en base et les objets stockés dans le service de fichiers ;
- préparer une étape ultérieure de contrôle plus avancé du contenu.

### Justification
Le contexte impose des photos pour les articles. Le téléversement est donc une surface d’exposition naturelle du système.

## 8.5 Risques liés aux dépendances et composants tiers

### Vulnérabilité potentielle
Présence de vulnérabilités connues dans les dépendances front ou back.

### Symptômes possibles
- résultats `High` ou `Critical` dans les scans ;
- dépendances obsolètes ;
- échecs ou alertes dans le pipeline CI/CD.

### Risques
- exploitation de failles connues ;
- propagation d’un risque par la chaîne logicielle ;
- difficultés de mise à jour tardive.

### Niveau de priorité
**Priorité 1** si vulnérabilité critique ou haute  
**Priorité 2** si vulnérabilités modérées non bloquantes

### Remédiations proposées
- corriger immédiatement les vulnérabilités `Critical` ;
- corriger ou justifier explicitement les vulnérabilités `High` ;
- mettre à jour les dépendances vulnérables ;
- intégrer un blocage du pipeline selon le niveau de sévérité ;
- maintenir un inventaire minimal des dépendances critiques.

### Justification
Le sujet impose explicitement une détection des vulnérabilités et la sécurité est une exigence majeure du contexte Collector.

## 8.6 Risques liés à la dette technique et à la qualité statique

### Vulnérabilité potentielle
Code trop dupliqué, trop complexe ou comportant des smells importants, rendant les corrections de sécurité plus difficiles et plus risquées.

### Symptômes possibles
- quality gate SonarQube en échec ;
- duplication au-dessus du seuil ;
- maintainability rating insuffisant ;
- dette technique en hausse.

### Risques
- corrections de sécurité plus coûteuses ;
- régressions fréquentes ;
- affaiblissement de la lisibilité des règles métier ;
- perte de maîtrise du projet au fil des évolutions.

### Niveau de priorité
**Priorité 2**

### Remédiations proposées
- corriger d’abord les duplications sur les zones critiques ;
- extraire les règles métier communes ;
- réduire la complexité des services les plus sensibles ;
- faire respecter les quality gates SonarQube sur le nouveau code ;
- traiter en priorité les smells des composants liés à l’authentification, à l’admin et aux écritures base.

### Justification
La dette technique ne constitue pas toujours une faille directe, mais elle augmente fortement le risque d’introduire ou de maintenir des vulnérabilités.

## 8.7 Risques liés à l’observabilité insuffisante

### Vulnérabilité potentielle
Logs trop peu détaillés, absence d’audit suffisant, difficulté à reconstituer un incident ou une action d’administration.

### Symptômes possibles
- impossibilité de distinguer une erreur fonctionnelle d’un refus d’accès ;
- absence d’identifiant d’acteur dans les logs métier ;
- manque de traces sur les changements de statut.

### Risques
- difficulté d’investigation ;
- difficulté à détecter un comportement anormal ;
- faible capacité de diagnostic lors d’un incident.

### Niveau de priorité
**Priorité 2**

### Remédiations proposées
- enrichir les logs sur les actions critiques ;
- conserver un audit minimum des actions admin ;
- ajouter un identifiant de corrélation par requête si ce n’est pas déjà fait ;
- structurer les messages de logs pour faciliter leur lecture ;
- définir une politique de conservation minimale pour l’environnement de démonstration.

### Justification
Le sujet impose au moins une composante d’observabilité et les résultats d’observabilité servent de base au plan de remédiation.

## 8.8 Risques liés à la performance et à la charge

### Vulnérabilité potentielle
Dégradation des temps de réponse ou augmentation du taux d’erreur sous charge sur les endpoints critiques.

### Symptômes possibles
- latence p95 trop élevée ;
- augmentation du taux d’erreur sous charge ;
- endpoint `GET /catalog` ou `POST /auth/login` plus coûteux que prévu ;
- temps de réponse variables selon le volume.

### Risques
- dégradation de l’expérience utilisateur ;
- fragilité de la disponibilité ;
- risque d’exploitation plus facile en cas de trafic anormal ;
- perception de manque de maturité technique.

### Niveau de priorité
**Priorité 2**

### Remédiations proposées
- optimiser les requêtes les plus lentes ;
- mettre en place pagination et filtres sur le catalogue si nécessaire ;
- ajouter un mécanisme de rate limiting sur les endpoints sensibles, notamment l’authentification ;
- surveiller les temps de réponse sur les routes critiques ;
- revoir les écritures ou lectures les plus coûteuses.

### Justification
Le sujet demande une démonstration de montée en charge, et ces résultats doivent servir à identifier des vulnérabilités potentielles ou des points faibles.

## 8.9 Risques liés à la configuration cloud et au déploiement

### Vulnérabilité potentielle
Configuration trop permissive des environnements déployés, mauvaise séparation des variables d’environnement ou CORS mal configuré.

### Symptômes possibles
- variables mal isolées entre environnements ;
- configuration CORS trop large ;
- endpoint de santé exposant trop d’informations ;
- erreurs de configuration constatées après déploiement.

### Risques
- exposition involontaire d’informations techniques ;
- facilité d’attaque accrue ;
- comportement incohérent entre local et environnement de démonstration.

### Niveau de priorité
**Priorité 2**

### Remédiations proposées
- restreindre CORS aux domaines nécessaires ;
- revoir les variables d’environnement exposées ;
- limiter les informations renvoyées par les endpoints techniques ;
- documenter précisément la configuration de déploiement ;
- ajouter des smoke tests de sécurité après déploiement.

### Justification
Le déploiement cloud fait partie du périmètre évalué. Une configuration imprécise peut annuler une partie des efforts faits dans le code.

## 9. Plan d’actions priorisé

## 9.1 Priorité 1 — Actions critiques

| ID | Action | Objectif | Justification | Responsable | Échéance |
|---|---|---|---|---|---|
| P1-01 | Revue complète des guards et contrôles de rôles sur toutes les routes sensibles | Garantir le cloisonnement seller/admin | Empêche les accès non autorisés aux fonctions critiques | Lead Dev + Dev back | `[à compléter]` |
| P1-02 | Renforcement de la gestion des secrets et du secret JWT | Protéger l’authentification | Réduit le risque d’usurpation et de compromission | Lead Dev + DevOps | `[à compléter]` |
| P1-03 | Validation systématique de tous les payloads côté API | Garantir l’intégrité des données | Réduit les contournements et les incohérences métier | Dev back | `[à compléter]` |
| P1-04 | Correction immédiate des vulnérabilités Critical et High | Réduire le risque logiciel connu | Répond aux scans de sécurité et au sujet | Lead Dev + DevOps | `[à compléter]` |
| P1-05 | Ajout de tests d’intégration négatifs sur toutes les routes critiques | Empêcher les régressions de sécurité | Rend les faiblesses visibles avant déploiement | Dev back + QA | `[à compléter]` |

## 9.2 Priorité 2 — Actions importantes

| ID | Action | Objectif | Justification | Responsable | Échéance |
|---|---|---|---|---|---|
| P2-01 | Durcissement de la gestion des uploads d’images | Réduire la surface d’attaque liée aux fichiers | Les images sont obligatoires dans le domaine métier | Dev back | `[à compléter]` |
| P2-02 | Ajout d’un rate limiting sur l’authentification et les endpoints sensibles | Réduire l’impact des abus ou surcharges | Protège la disponibilité et la sécurité | Dev back + DevOps | `[à compléter]` |
| P2-03 | Réduction des duplications et smells critiques SonarQube | Améliorer la maintenabilité des zones sensibles | Facilite les corrections futures de sécurité | Lead Dev + équipe | `[à compléter]` |
| P2-04 | Enrichissement des logs et de l’audit admin | Améliorer la traçabilité | Facilite le diagnostic et la remédiation | Dev back | `[à compléter]` |
| P2-05 | Revue de configuration cloud et CORS | Réduire les erreurs de configuration | Sécurise l’environnement déployé | DevOps | `[à compléter]` |
| P2-06 | Optimisation des endpoints lents identifiés sous charge | Réduire la latence p95 et le taux d’erreur | Améliore la robustesse sous trafic | Dev back | `[à compléter]` |

## 9.3 Priorité 3 — Actions d’amélioration

| ID | Action | Objectif | Justification | Responsable | Échéance |
|---|---|---|---|---|---|
| P3-01 | Mise en place d’une stratégie plus avancée de rotation / renouvellement de tokens | Renforcer la gestion d’accès | Prépare l’industrialisation | Lead Dev | `[à compléter]` |
| P3-02 | Ajout de métriques applicatives plus fines | Mieux suivre la disponibilité et les performances | Améliore l’observabilité | Dev back + DevOps | `[à compléter]` |
| P3-03 | Renforcement de la stratégie de tests E2E | Sécuriser le parcours complet | Augmente la confiance sur les évolutions futures | QA + équipe | `[à compléter]` |
| P3-04 | Préparation d’un contrôle plus automatisé des annonces et contenus | Préparer les futures exigences métier | Reste cohérent avec l’évolution visée de Collector | Lead Dev | `[à compléter]` |
| P3-05 | Préparation de l’intégration future des modules paiement, fraude et notifications | Préparer la v2 sur une base plus sûre | Anticipe les évolutions du produit | Lead Dev | `[à compléter]` |

## 10. Ordre recommandé d’exécution

L’ordre recommandé de mise en œuvre est le suivant :

1. sécurisation des autorisations et des routes sensibles ;
2. renforcement des secrets et de la gestion JWT ;
3. correction des vulnérabilités critiques ou hautes ;
4. durcissement des validations côté API ;
5. ajout de tests de non-régression de sécurité ;
6. durcissement des uploads ;
7. amélioration des logs et de l’audit ;
8. réduction de la dette technique sur les zones critiques ;
9. optimisation des endpoints identifiés comme lents ;
10. durcissement de la configuration cloud.

Cet ordre permet de traiter d’abord les points ayant le plus fort impact sur l’intégrité, la confidentialité et la disponibilité.

## 11. Validation après remédiation

Chaque action de remédiation devra être revalidée par des preuves mesurables.

### Pour les accès et rôles
- nouveaux tests d’intégration positifs et négatifs ;
- logs de refus d’accès ;
- vérification du cloisonnement seller/admin.

### Pour les secrets et JWT
- audit de configuration ;
- vérification des environnements ;
- contrôle de l’absence de secrets dans le dépôt.

### Pour la validation des entrées
- nouveaux tests négatifs ;
- vérification de l’absence d’incohérences base ;
- revue des DTOs et services.

### Pour les dépendances
- nouveau scan de vulnérabilités ;
- justification explicite des alertes restantes.

### Pour la qualité statique
- nouveau passage SonarQube ;
- quality gate validée ;
- amélioration des sous-indicateurs ciblés.

### Pour la charge et la performance
- nouvelle campagne Siege ou JMeter ;
- comparaison avant / après sur les endpoints critiques ;
- observation de la latence p95 et du taux d’erreur.

## 12. Lien avec les métriques qualité

Le plan de remédiation est directement relié aux métriques définies dans le document 04.

### Couverture de tests
Les remédiations P1-05 et P3-03 renforcent la capacité à éviter les régressions de sécurité et de conformité fonctionnelle.

### Vulnérabilités critiques ou hautes
Les remédiations P1-04 ciblent directement cette métrique.

### Latence p95 des endpoints critiques
Les remédiations P2-02 et P2-06 ciblent directement cette métrique.

### Qualité statique et dette technique
Les remédiations P2-03 ciblent directement cette métrique.

## 13. Risques résiduels acceptés à ce stade

Dans le cadre d’un prototype, certains risques résiduels peuvent être acceptés temporairement s’ils sont documentés et maîtrisés.

### Risques résiduels potentiellement acceptables
- observabilité moins avancée qu’en production ;
- absence de mécanismes complexes de révocation de session ;
- couverture partielle de certaines zones front secondaires ;
- limitations de performance au-delà d’une charge modérée ;
- absence de contrôle automatisé avancé sur le contenu des annonces.

### Condition d’acceptation
Ces risques ne sont acceptables que si :
- ils n’exposent pas directement une faille critique ;
- ils sont connus, documentés et assumés ;
- ils font l’objet d’une action prévue dans la feuille de route de sécurité.

## 14. Recommandation globale

La version 1 du prototype Collector peut être considérée comme une base crédible de démonstration si :
- le parcours métier principal est conforme ;
- les contrôles d’accès sont robustes ;
- aucune vulnérabilité critique ne subsiste ;
- les écarts SonarQube les plus importants sont traités ;
- les points faibles observés sous charge sont documentés et corrigés ou justifiés.

La priorité n’est pas de transformer immédiatement le prototype en plateforme de production complète, mais de :
- fiabiliser les fondations de sécurité ;
- limiter la dette technique ;
- rendre les prochaines évolutions moins risquées ;
- démontrer une démarche technique structurée et réaliste.

## 15. Conclusion

Le plan de remédiation proposé pour Collector repose sur une analyse concrète des résultats de la version 1 du prototype. Il identifie les principales vulnérabilités potentielles autour :
- des accès ;
- des secrets ;
- des validations ;
- des uploads ;
- des dépendances ;
- de la dette technique ;
- de l’observabilité ;
- de la charge ;
- de la configuration cloud.

Les actions proposées sont priorisées, justifiées et directement reliées aux métriques qualité du projet. Elles permettent de renforcer la sécurité du prototype tout en restant adaptées à son niveau de maturité et au contexte métier de Collector.