# 02 - Backlog du POC Collector

## 1. Objectif du backlog

Ce backlog décrit la fonctionnalité métier retenue pour le prototype Collector.shop.

Le périmètre retenu pour le POC est le suivant :
- authentification des utilisateurs,
- gestion des rôles `seller` et `admin`,
- création d’une annonce par un vendeur,
- validation ou rejet d’une annonce par un administrateur,
- publication des annonces validées dans le catalogue public,
- gestion des catégories par un administrateur.

Ce choix est cohérent avec les exigences du contexte :
- les vendeurs et acheteurs doivent disposer d’un espace authentifié,
- l’administrateur gère le back-office et les catégories,
- le catalogue est consultable sans authentification,
- un article doit comporter des photos, une description, un prix et d’éventuels frais de port,
- la mise en ligne n’est possible qu’après contrôle. 

## 2. Acteurs

- **Visiteur** : utilisateur non authentifié consultant le catalogue
- **Seller** : utilisateur authentifié pouvant créer des annonces
- **Admin** : utilisateur authentifié gérant les catégories et validant les annonces

## 3. Statuts métier retenus

Les statuts métier des annonces dans le POC sont :
- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`

## 4. Backlog priorisé

### US1 — Authentification et autorisation

**En tant que** utilisateur  
**Je veux** me connecter à la plateforme  
**Afin de** accéder aux fonctionnalités autorisées selon mon rôle

**Priorité** : Haute

**Critères d’acceptation**
1. Un utilisateur peut se connecter avec son email et son mot de passe.
2. Une authentification réussie retourne un jeton JWT valide.
3. Les endpoints seller nécessitent un utilisateur authentifié.
4. Les endpoints admin nécessitent un utilisateur authentifié ayant le rôle `admin`.
5. Un utilisateur non authentifié ne peut pas accéder aux endpoints privés.
6. Un utilisateur authentifié mais non admin reçoit un refus d’accès sur les opérations d’administration.

---

### US2 — Création d’une annonce par un vendeur

**En tant que** seller  
**Je veux** créer une annonce pour un objet de collection  
**Afin de** proposer mon article à la vente sur Collector.shop

**Priorité** : Haute

**Critères d’acceptation**
1. Seul un utilisateur authentifié ayant le rôle `seller` peut créer une annonce.
2. Une annonce doit contenir au minimum :
   - un titre,
   - une description,
   - un prix,
   - les frais de port,
   - une catégorie,
   - au moins une image.
3. Si un champ obligatoire est manquant, la création est refusée avec un message explicite.
4. Lors de sa création, l’annonce prend le statut `PENDING_REVIEW`.
5. Une annonce en attente de validation n’est pas visible dans le catalogue public.
6. L’annonce créée est associée au vendeur connecté.

---

### US3 — Consultation des annonces en attente par l’administrateur

**En tant que** admin  
**Je veux** consulter la liste des annonces en attente  
**Afin de** décider lesquelles peuvent être publiées

**Priorité** : Haute

**Critères d’acceptation**
1. Seul un utilisateur ayant le rôle `admin` peut consulter les annonces en attente.
2. La liste affiche uniquement les annonces au statut `PENDING_REVIEW`.
3. Pour chaque annonce, l’admin peut voir les informations utiles au contrôle :
   - titre,
   - description,
   - prix,
   - frais de port,
   - catégorie,
   - images,
   - identité du vendeur.
4. Un utilisateur non admin ne peut pas accéder à cette liste.

---

### US4 — Validation ou rejet d’une annonce par l’administrateur

**En tant que** admin  
**Je veux** approuver ou rejeter une annonce  
**Afin de** contrôler les articles publiés sur la plateforme

**Priorité** : Haute

**Critères d’acceptation**
1. Seul un admin peut approuver une annonce.
2. Seul un admin peut rejeter une annonce.
3. Lorsqu’une annonce est approuvée, son statut devient `APPROVED`.
4. Lorsqu’une annonce est rejetée, son statut devient `REJECTED`.
5. Une annonce déjà approuvée ou rejetée ne peut pas être retraitée une seconde fois sans action explicite prévue.
6. L’action de validation ou de rejet est journalisée dans les logs de l’application.
7. La date de décision et l’identifiant de l’admin sont conservés.

---

### US5 — Consultation du catalogue public

**En tant que** visiteur  
**Je veux** consulter le catalogue public  
**Afin de** parcourir les objets disponibles sans avoir à me connecter

**Priorité** : Haute

**Critères d’acceptation**
1. Le catalogue public est accessible sans authentification.
2. Seules les annonces au statut `APPROVED` sont visibles dans le catalogue.
3. Les annonces `PENDING_REVIEW` et `REJECTED` ne sont jamais visibles publiquement.
4. Pour chaque annonce visible, les informations suivantes sont affichées :
   - titre,
   - description,
   - prix,
   - frais de port,
   - catégorie,
   - image principale.
5. Le catalogue peut être filtré par catégorie.

---

### US6 — Gestion des catégories par l’administrateur

**En tant que** admin  
**Je veux** créer et gérer les catégories  
**Afin de** structurer les annonces du catalogue

**Priorité** : Moyenne

**Critères d’acceptation**
1. Seul un admin peut créer une catégorie.
2. Seul un admin peut modifier le libellé d’une catégorie.
3. Une catégorie ne peut pas être créée deux fois avec le même nom.
4. Une annonce doit être rattachée à une catégorie existante.
5. Les catégories disponibles sont proposées au vendeur lors de la création d’une annonce.
6. Les catégories servent de filtre dans le catalogue public.

## 5. Backlog de réalisation conseillé

Ordre recommandé de développement :

1. US1 — Authentification et autorisation
2. US6 — Gestion des catégories
3. US2 — Création d’annonce
4. US3 — Consultation des annonces en attente
5. US4 — Validation / rejet admin
6. US5 — Catalogue public

Cet ordre permet de construire d’abord les fondations de sécurité et d’administration, puis le flux métier principal de bout en bout.

## 6. Hors périmètre du POC

Les éléments suivants ne sont pas traités dans cette version du prototype :
- paiement en ligne,
- chat vendeur / acheteur,
- notifications,
- détection de fraude,
- recommandations personnalisées,
- gestion avancée des boutiques vendeurs,
- internationalisation complète,
- accessibilité avancée.

Ces fonctionnalités restent cohérentes avec le contexte global du produit mais ne sont pas nécessaires pour démontrer la faisabilité du flux métier choisi dans le cadre du prototype. 