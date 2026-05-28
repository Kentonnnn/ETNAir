# ETNAir 🏠

Plateforme de location de logements à court et moyen terme - Projet étudiant ETNA.

## Prérequis

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation

### 1. Cloner le repository

```bash
git clone git@github.com:Kentonnnn/ETNAir.git
cd ETNAir
```

### 2. Démarrer l'environnement

```bash
docker compose up --build -d
```

Le service API attend la base de données, exécute les migrations Prisma et lance le serveur automatiquement.

### 3. Vérifier que l'API fonctionne

```bash
curl http://localhost:3000
```

Vous devriez obtenir :

```json
{ "message": "Hello, ETNAir!" }
```

### 4. Arrêter l'environnement

```bash
docker compose down
```

## Services

| Service | Description | Port |
|---------|-------------|------|
| api | API Node.js Express | 3000 |
| db | Base de données PostgreSQL | 5432 |
| pgadmin | Interface web PostgreSQL | 5050 |

## Accès pgAdmin

- URL : http://localhost:5050
- Email : harvey@etnair.xyz
- Password : harvey

## Structure du projet

```
ETNAir/
├── api/           # Code Node.js
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── db/            # Fichiers PostgreSQL
├── docker-compose.yml
└── README.md
```