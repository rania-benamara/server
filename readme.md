# API de Gestion de Contacts

Ce projet est une API REST pour la gestion de contacts et de notes, construite avec Node.js, Express et MySQL.

## Fonctionnalités

- Authentification des utilisateurs (inscription, connexion) avec JWT
- Opérations CRUD pour les utilisateurs
- Opérations CRUD pour les contacts
- Opérations CRUD pour les notes associées aux contacts
- Routes protégées utilisant l'authentification JWT

## Prérequis

- Node.js
- MySQL
- npm

## Installation

1. Clonez le dépôt
2. Exécutez `npm install` pour installer les dépendances
3. Configurez votre base de données MySQL et mettez à jour les détails de connexion dans `app.js`
4. Créez les tables nécessaires dans votre base de données (utilisateurs, contacts, notes)

## Configuration

Mettez à jour les variables suivantes dans `app.js` :

- `PORT` : Le port sur lequel le serveur s'exécutera (par défaut : 3000)
- `SECRET_KEY` : Votre clé secrète JWT
- Détails de connexion à la base de données (hôte, utilisateur, mot de passe, nom de la base de données)

## Points d'accès de l'API

### Authentification
- `POST /register` : Inscrire un nouvel utilisateur
- `POST /login` : Se connecter et recevoir un JWT

### Utilisateurs
- `GET /user` : Obtenir les informations de l'utilisateur actuel (protégé)
- `PUT /users/:id` : Mettre à jour un utilisateur (protégé)
- `DELETE /users/:id` : Supprimer un utilisateur (protégé)

### Contacts
- `GET /contacts` : Obtenir tous les contacts de l'utilisateur authentifié (protégé)
- `GET /contacts/:id` : Obtenir un contact spécifique (protégé)
- `POST /contacts` : Créer un nouveau contact (protégé)
- `PUT /contacts/:id` : Mettre à jour un contact (protégé)
- `DELETE /contacts/:id` : Supprimer un contact (protégé)

### Notes
- `GET /contacts/:contactId/notes` : Obtenir toutes les notes d'un contact (protégé)
- `POST /contacts/:contactId/notes` : Créer une nouvelle note pour un contact (protégé)
- `PUT /notes/:id` : Mettre à jour une note (protégé)
- `DELETE /notes/:id` : Supprimer une note (protégé)

## Exécution du serveur

Exécutez `node app.js` pour démarrer le serveur. L'API sera disponible à l'adresse `http://localhost:3000` (ou sur le port que vous avez spécifié).

## Note de sécurité

Assurez-vous de garder votre `SECRET_KEY` confidentielle et d'utiliser des variables d'environnement pour les informations sensibles dans un environnement de production.
