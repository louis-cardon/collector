# 01 - Cadrage du POC Collector

## 1. Objectif du prototype
L’objectif du prototype est de démontrer la faisabilité technique d’une première version de Collector.shop à travers un flux métier central de mise en vente d’un article par un vendeur, avec contrôle par un administrateur avant publication dans le catalogue public.

## 2. Fonctionnalité métier retenue
Le POC implémente le flux suivant :
1. un vendeur authentifié crée une annonce,
2. l’annonce est enregistrée avec le statut `PENDING_REVIEW`,
3. un administrateur consulte les annonces en attente,
4. l’administrateur approuve ou rejette l’annonce,
5. une annonce approuvée devient visible dans le catalogue public,
6. les catégories sont gérées par l’administrateur.

## 3. Exigences fonctionnelles retenues
Les exigences retenues pour le POC sont :
- authentification des utilisateurs,
- gestion des rôles `seller` et `admin`,
- création d’une annonce avec titre, description, prix, frais de port, catégorie et au moins une image,
- consultation des annonces en attente par l’administrateur,
- validation ou rejet d’une annonce par l’administrateur,
- consultation publique du catalogue des annonces approuvées,
- gestion des catégories par l’administrateur.

## 4. Exigences non retenues dans le POC
Les exigences suivantes ne sont pas implémentées dans cette version :
- paiement en ligne,
- chat vendeur/acheteur,
- notifications,
- détection de fraude,
- recommandations,
- gestion avancée des boutiques vendeurs,
- internationalisation complète,
- accessibilité avancée.

## 5. Justification du périmètre
Ce périmètre a été choisi car il couvre un flux métier central de la plateforme Collector.shop :
- il implique plusieurs rôles,
- il met en œuvre un contrôle métier avant publication,
- il permet de démontrer la sécurité, les tests, l’observabilité et le déploiement,
- il reste compatible avec une réalisation au niveau prototype.

## 6. Hypothèses techniques
Le prototype reposera sur :
- un front-end Next.js,
- une API NestJS,
- une base PostgreSQL,
- une authentification JWT avec rôles,
- un pipeline CI/CD avec tests automatisés,
- une solution minimale d’observabilité,
- un déploiement sur un fournisseur cloud.

## 7. Critères de réussite du prototype
Le prototype sera considéré comme réussi si :
- un vendeur peut créer une annonce,
- un admin peut approuver ou rejeter une annonce,
- seules les annonces approuvées sont visibles dans le catalogue public,
- les endpoints sont sécurisés selon le rôle,
- le pipeline exécute les tests automatiquement,
- l’application est déployée et démontrable.