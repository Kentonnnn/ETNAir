# ETNAir — Documentation générale

> Plateforme de location de logements étudiants — projet ETNA C2W-CBI1

---

## 🎯 Vue d'ensemble

ETNAir est une plateforme web type Airbnb pensée pour les étudiants. Elle permet :

- aux **locataires** de rechercher, filtrer (ville, prix, dates) et réserver des logements
- aux **propriétaires** de publier, modifier et gérer leurs annonces
- de mettre en favoris, laisser des avis, suivre ses réservations
- une vue **liste / grille / carte** (Leaflet) des annonces
- un mode **clair / sombre** persistant

---

## 🏗 Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│   Frontend Vue  │ ───▶│  API Express   │ ───▶│  PostgreSQL  │
│  (Vite, Pinia)  │      │ (Prisma ORM)   │      │  (volumes)   │
└─────────────────┘      └─────────────────┘      └──────────────┘
        │                        │
        │                        └─── uploads/   (images sur disque)
        │
        └─── localStorage : token JWT, theme, favoris, reviews, profile pic
```

| Couche | Technologie |
|---|---|
| Frontend | Vue 3 + Vite + Pinia + Vue Router + Leaflet |
| Backend | Node.js 24 + Express 5 + Prisma 6 |
| Base | PostgreSQL 16 |
| Conteneurisation | Docker + Docker Compose |
| Production | Kubernetes (HPA, CronJob, Ingress) |
| CI/CD | GitLab CI |
| Tests | Jest (API) + Cypress (E2E) |

---

## 📁 Structure du repo

```
ETNAIR/
├── api/                  # Backend Express + Prisma
├── frontend/             # SPA Vue 3
├── db/                   # Init SQL legacy
├── k8s/                  # Manifests Kubernetes
├── k6/                   # Tests de charge
├── docs/                 # ← Cette documentation
├── docker-compose.yml    # Stack dev locale
├── .gitlab-ci.yml        # Pipeline CI
└── README.md
```

---

## 🚀 Démarrage rapide (Docker)

```bash
git clone <repo>
cd ETNAIR
docker compose up -d
```

Services disponibles :
- **Frontend** : http://localhost:5173
- **API** : http://localhost:3000
- **Swagger** : http://localhost:3000/api-docs
- **PgAdmin** : http://localhost:5050 (harvey@etnair.xyz / harvey)

Le seed crée automatiquement **35 utilisateurs** et **~127 annonces** dans **35 villes**.

---

## 📚 Sous-documentations

| Sujet | Fichier |
|---|---|
| Frontend (Vue, routes, stores) | [frontend.md](./frontend.md) |
| Backend (API REST, contrôleurs) | [backend.md](./backend.md) |
| Base de données (modèle Prisma) | [database.md](./database.md) |
| Docker (dev local) | [docker.md](./docker.md) |
| Kubernetes (production) | [kubernetes.md](./kubernetes.md) |
| Tests (Jest, Cypress, k6) | [tests.md](./tests.md) |

---

## 👥 Équipe

- **Harvey M.**
- **Nelson P.**
- **Alexandre C.**
- **Yamine I.** 

---

## 📄 Licence

Projet pédagogique ETNA — usage interne uniquement.
