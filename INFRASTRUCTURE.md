# Documentation Technique — ETNAir Infrastructure

## 1. Présentation du projet

ETNAir est une plateforme de location courte et moyenne durée (type Airbnb). Ce document décrit l'architecture infrastructure mise en place pour déployer, monitorer et maintenir l'application.

**Équipe infrastructure :** Nelson Pires Da Silva  
**Période :** Avril — Juin 2026  
**Stack :** Kubernetes (K3s) · Docker · GitLab CI · GitHub Actions · Prometheus · Grafana · Loki

---

## 2. Architecture globale

```
GitHub (source de vérité)
    │
    ├── GitHub Actions (CI/CD)
    │       ├── Tests automatiques (develop + main)
    │       ├── Build & push images Docker Hub (main)
    │       └── Mirror automatique → GitLab
    │
    └── GitLab (rendu école)
            └── GitLab CI (tests + deploy)
                    └── GitLab Runner sur Kubernetes

VM École (172.16.248.98) — réseau privé VPN
    └── Kubernetes K3s
            ├── Namespace default
            │       ├── API (Node.js)
            │       ├── Frontend (Vue.js)
            │       └── PostgreSQL
            ├── Namespace monitoring
            │       ├── Prometheus
            │       ├── Grafana
            │       ├── Loki + Promtail
            │       └── Alertmanager
            ├── Namespace gitlab
            │       └── GitLab Runner
            └── Namespace storage
                    └── MinIO
```

---

## 3. Choix techniques

### 3.1 Kubernetes K3s
K3s est une distribution légère de Kubernetes, idéale pour une VM avec des ressources limitées. Il intègre nativement Traefik comme Ingress Controller.

### 3.2 Docker & Docker Hub
Chaque service (API, Frontend) est conteneurisé via Docker. Les images sont buildées par la pipeline CI/CD et publiées sur Docker Hub (`kentonnnn/etnair-api`, `kentonnnn/etnair-frontend`).

### 3.3 Traefik (Ingress Controller)
Traefik est utilisé comme reverse proxy pour exposer les services :
- `/` → Frontend
- `/api` → API backend

### 3.4 MinIO (Stockage S3)
MinIO est déployé sur Kubernetes pour le stockage d'objets (images des annonces). Compatible avec l'API S3 d'AWS.

### 3.5 Prometheus + Grafana
Stack de monitoring standard Kubernetes :
- **Prometheus** → collecte les métriques des pods et du cluster
- **Grafana** → visualisation des métriques et logs
- **Loki + Promtail** → centralisation des logs de tous les pods

---

## 4. Déploiement des services

### 4.1 Environnement local (développement)

```bash
git checkout develop
git pull
docker compose up -d --build
```

Services disponibles en local :
- API : http://localhost:3000
- Frontend : http://localhost:5173
- pgAdmin : http://localhost:5050

### 4.2 Environnement de production (Kubernetes)

Les fichiers de déploiement Kubernetes sont dans le dossier `k8s/` :

```
k8s/
├── api-deployment.yml       # Déploiement API
├── api-service.yml          # Service API
├── frontend-deployment.yml  # Déploiement Frontend
├── frontend-service.yml     # Service Frontend
├── ingress.yml              # Ingress Traefik
└── hpa.yml                  # Horizontal Pod Autoscaler
```

Pour déployer manuellement :
```bash
kubectl apply -f k8s/
```

La pipeline CI/CD effectue ce déploiement automatiquement après chaque merge sur `main`.

### 4.3 Base de données

PostgreSQL est déployé sur Kubernetes avec un volume persistant. Les migrations sont gérées par **Prisma**.

Le seed de la base de données est automatiquement exécuté au démarrage de l'API via Docker Compose.

---

## 5. Pipeline CI/CD

### 5.1 GitHub Actions

Fichier : `.github/workflows/deploy.yml`

| Branche | Job test | Job deploy |
|---------|----------|------------|
| develop | ✅ | ❌ |
| main    | ✅ | ✅ |

**Job test :** Installation des dépendances + exécution des tests Jest  
**Job deploy :** Build image Docker + push sur Docker Hub + déploiement Kubernetes

### 5.2 GitLab CI

Fichier : `.gitlab-ci.yml`

Le GitLab Runner est déployé sur Kubernetes via Helm dans le namespace `gitlab`.

```bash
helm install gitlab-runner gitlab/gitlab-runner \
  --namespace gitlab \
  --set gitlabUrl=https://rendu-git.etna-alternance.net \
  --set runnerToken=<TOKEN>
```

### 5.3 Mirror GitHub → GitLab

Fichier : `.github/workflows/mirror-to-gitlab.yml`

À chaque push sur `develop` ou `main`, le code est automatiquement synchronisé sur GitLab via une Deploy Key SSH. Plus besoin de pusher manuellement sur les deux remotes.

### 5.4 Variables CI/CD

| Variable | Description |
|----------|-------------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub |
| `KUBECONFIG` | Config de connexion au cluster K3s |

---

## 6. Monitoring

### 6.1 Accès Grafana

URL : `http://172.16.248.98:30692`  
*(Accessible uniquement depuis le réseau de l'école ou via VPN)*

### 6.2 Dashboards disponibles

| Dashboard | Description |
|-----------|-------------|
| Kubernetes / Compute Resources / Cluster | CPU et RAM du cluster |
| Kubernetes / Compute Resources / Pod | Métriques par pod |
| Kubernetes / Networking / Cluster | Trafic réseau |
| Node Exporter / Nodes | Métriques du serveur |
| Loki Kubernetes Logs | Logs en temps réel |

### 6.3 Logs avec Loki

Les logs de tous les pods sont collectés par **Promtail** et envoyés à **Loki**.

Pour consulter les logs dans Grafana → Explore → Loki :
```
{namespace="default"}       # Logs de l'API et du frontend
{namespace="monitoring"}    # Logs du stack monitoring
```

---

## 7. Scalabilité (HPA)

Un **Horizontal Pod Autoscaler** est configuré pour l'API et le frontend.

```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

Le HPA augmente automatiquement le nombre de pods si le CPU dépasse 70%.

---

## 8. Accès aux services

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://172.16.248.98 | VPN requis |
| API | http://172.16.248.98/api | VPN requis |
| Swagger | http://172.16.248.98:32493/api-docs | VPN requis |
| Grafana | http://172.16.248.98:30692 | VPN requis |
| MinIO | http://172.16.248.98 (port interne) | Cluster interne |
| pgAdmin | http://172.16.248.98:5050 | VPN requis |

> **Note :** Tous les services sont sur le réseau privé de l'école. L'accès depuis l'extérieur nécessite le VPN fourni par l'école.

---

## 9. Résumé des technologies

| Technologie | Usage | Version |
|-------------|-------|---------|
| Kubernetes K3s | Orchestration | v1.x |
| Docker | Conteneurisation | 24+ |
| Traefik | Reverse proxy / Ingress | v2 |
| PostgreSQL | Base de données | 16 |
| Prisma | ORM | 7.x |
| Prometheus | Métriques | - |
| Grafana | Visualisation | 11.x |
| Loki | Logs | 3.x |
| Promtail | Collecte logs | 3.x |
| MinIO | Stockage S3 | - |
| GitLab Runner | CI/CD | 18.x |
| Helm | Gestionnaire de packages K8s | 3.x |

