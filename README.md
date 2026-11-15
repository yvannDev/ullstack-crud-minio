# Mini CRUD – Next.js, Express, PostgreSQL et MinIO

Mini-projet full-stack permettant de gérer des produits (CRUD) et de stocker leurs images dans MinIO, un stockage objet compatible avec l'API Amazon S3.

## Technologies

- **Frontend :** Next.js, React et TypeScript
- **Backend :** Node.js, Express.js et TypeScript
- **Base de données :** PostgreSQL
- **Stockage des fichiers :** MinIO (API compatible S3)
- **Conteneurisation :** Docker et Docker Compose

## Architecture

```text
mini-crud-minio/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── infra/
│   └── docker/
│       └── docker-compose.yml
├── .env.example
└── README.md
```

Les Dockerfiles se trouvent dans les dossiers respectifs des applications. Docker Compose est utilisé pour orchestrer les services et leurs dépendances.

## Fonctionnement du stockage des images

Lorsqu'un produit est créé ou modifié avec une image :

1. Le frontend envoie les données du produit et le fichier image au backend en `multipart/form-data`.
2. Le backend valide les données et envoie le fichier dans un bucket MinIO.
3. MinIO stocke le fichier en tant qu'objet.
4. PostgreSQL conserve la clé de l'objet dans le champ `image_key`, et non le fichier lui-même.
5. Le backend génère une URL présignée temporaire permettant d'afficher l'image.

Exemple :

- **Objet dans MinIO :** `products/25/photo.webp`
- **Référence dans PostgreSQL :** `products/25/photo.webp`

PostgreSQL conserve donc la référence de l'image tandis que MinIO conserve le fichier.

## API du backend

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/products` | Lister les produits |
| GET | `/api/products/:id` | Consulter un produit |
| POST | `/api/products` | Créer un produit avec image facultative |
| PUT | `/api/products/:id` | Modifier un produit |
| DELETE | `/api/products/:id` | Supprimer un produit |

Pour la création et la modification, les données sont envoyées en `multipart/form-data` avec les champs `name`, `description`, `price` et éventuellement `image`.

## Configuration de l'environnement

1. Créer les fichiers d'environnement nécessaires à partir des fichiers `.env.example` fournis.
2. Renseigner les identifiants PostgreSQL et MinIO ainsi que les paramètres de connexion utilisés par le backend et le frontend.
3. Ne jamais publier les fichiers `.env` contenant des secrets dans Git.

Les noms et emplacements exacts des variables doivent correspondre aux fichiers `.env.example` du projet et à la configuration de `docker-compose.yml`.

## Démarrer PostgreSQL et MinIO

Depuis la racine du projet :

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Vérifier l'état des conteneurs :

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

Accès local MinIO (avec les ports standards configurés dans Compose) :

- Console web : http://localhost:9001
- API S3 : http://localhost:9000

Connectez-vous avec les identifiants définis dans votre configuration d'environnement. N'utilisez pas des identifiants d'exemple en production.

## Construire les images du frontend et du backend

Les commandes suivantes sont à exécuter depuis la racine du dépôt.

Construire l'image du backend :

```bash
docker build -t mini-crud-backend:latest ./backend
```

Construire l'image du frontend :

```bash
docker build -t mini-crud-frontend:latest ./frontend
```

Lister les images locales :

```bash
docker images
```

Pour reconstruire sans utiliser le cache :

```bash
docker build --no-cache -t mini-crud-backend:latest ./backend
docker build --no-cache -t mini-crud-frontend:latest ./frontend
```

Ces commandes construisent les images ; elles ne démarrent pas les conteneurs.

## Stratégie Docker : multi-stage build

Les Dockerfiles du frontend et du backend utilisent une construction en plusieurs étapes (*multi-stage build*) :

- **deps :** installe les dépendances nécessaires à la construction.
- **builder :** compile l'application (notamment TypeScript pour le backend et Next.js pour le frontend).
- **runner :** contient les éléments nécessaires à l'exécution de l'application.

Cette séparation évite d'embarquer dans l'image finale les outils et dépendances utilisés uniquement pendant la compilation. Le frontend Next.js utilise le mode `output: "standalone"` dans sa configuration pour produire un serveur de production autonome.

### À propos de Distroless

Les images actuelles utilisent `node:22-alpine` pour leurs étapes Node.js. Elles sont multi-stage, mais **elles ne sont pas encore Distroless**.

Distroless est une optimisation supplémentaire possible pour réduire la surface de l'image d'exécution. Elle n'a pas encore été intégrée ni testée dans ce projet. Il faudra vérifier la compatibilité des dépendances natives, les fichiers copiés et le démarrage de chaque application avant de l'adopter.

## Vérifier la taille des images

```bash
docker images mini-crud-backend:latest mini-crud-frontend:latest
docker system df
```

La taille réelle dépend des dépendances installées et du contenu de l'application. Elle doit être mesurée après la construction ; aucune taille précise n'est garantie ici.

## Arrêter les services

Arrêter et supprimer les conteneurs et le réseau créés par Compose :

```bash
docker compose -f infra/docker/docker-compose.yml down
```

Pour supprimer également les volumes et donc les données persistées, utiliser `-v` avec prudence :

```bash
docker compose -f infra/docker/docker-compose.yml down -v
```

**Attention :** cette dernière commande peut supprimer les données PostgreSQL et MinIO stockées dans les volumes Docker.

## Remarques

- Les commandes de build ci-dessus supposent que chaque application possède un `package-lock.json` et que les Dockerfiles utilisent `npm ci`.
- Le Dockerfile frontend suppose que `output: "standalone"` est activé dans `next.config.ts` ou `next.config.js`.
- Le Dockerfile backend suppose que `npm run build` génère `dist/server.js`.
- Cette documentation décrit la configuration préparée dans le cadre du mini-projet. Les images et le déploiement doivent être testés dans l'environnement cible avant une utilisation en production.
