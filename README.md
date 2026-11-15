# Mini CRUD — Next.js + Express + PostgreSQL + MinIO

Projet pédagogique de gestion de produits avec images stockées dans MinIO.

## Architecture
- `frontend/` : Next.js App Router + TypeScript
- `backend/` : Express + TypeScript + PostgreSQL (`pg`) + AWS SDK v3 pour MinIO
- `infra/docker/docker-compose.yml` : PostgreSQL et MinIO en local

## Prérequis
- Node.js 20+
- npm
- Docker et Docker Compose

## 1. Configuration
À la racine :
```bash
cp .env.example .env
```
Les valeurs sont destinées au développement local uniquement. Ne publie jamais `.env`.

## 2. Démarrer PostgreSQL et MinIO
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
Console MinIO : http://localhost:9001  
API MinIO : http://localhost:9000  
Identifiants locaux par défaut : `minioadmin` / `minioadmin123` (à changer avant toute exposition réseau).

## 3. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
API : http://localhost:4000  
Au démarrage, le backend crée la table `products` et le bucket configuré s'il n'existe pas.

## 4. Frontend
Dans un autre terminal :
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Interface : http://localhost:3000

## API
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` — `multipart/form-data` : `name`, `description`, `price`, `image`
- `PUT /api/products/:id` — mêmes champs, image facultative
- `DELETE /api/products/:id`

## Fonctionnement des images
Les fichiers sont stockés dans MinIO. PostgreSQL conserve seulement `image_key`, la clé de l'objet MinIO. L'API fournit une URL présignée temporaire pour afficher chaque image.

## Notes importantes
- Projet d'apprentissage, pas une configuration prête pour la production.
- Change les identifiants MinIO et mots de passe avant tout déploiement.
- En production, utilise HTTPS, un vrai système de gestion des secrets, des validations renforcées, des limites réseau et une stratégie de sauvegarde.
- Les URL présignées expirent après 1 heure par défaut.
