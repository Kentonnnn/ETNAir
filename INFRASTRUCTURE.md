# Documentation Technique — ETNAir Infrastructure

## 1. Présentation du projet

ETNAir est une plateforme de location courte et moyenne durée (type Airbnb). Ce document décrit l'architecture infrastructure mise en place pour déployer, monitorer et maintenir l'application sur les 5 étapes du projet.

**Équipe infrastructure :** Nelson Pires Da Silva  
**Période :** Avril — Juin 2026  
**VM :** École ETNA, IP `172.16.248.98`, 2 vCPU, 4 GB RAM, réseau privé (VPN requis)

**Stack technique :**

| Composant | Technologie |
|-----------|-------------|
| Orchestration | Kubernetes K3s |
| Conteneurisation | Docker + Docker Hub |
| Images Docker | `kentonnnn/etnair-api`, `kentonnnn/etnair-frontend` |
| Reverse proxy | Traefik (Ingress Controller natif K3s) |
| Base de données | PostgreSQL 16 |
| ORM | Prisma 7.x |
| Stockage objets | MinIO (compatible S3) |
| Monitoring | Prometheus + Grafana + Loki + Promtail |
| CI/CD | GitHub Actions + GitLab CI + GitLab Runner (Helm) |

---

## 2. Architecture globale

```
GitHub (source de vérité)
    │
    ├── GitHub Actions (CI/CD)
    │       ├── Tests automatiques (develop + main)
    │       ├── Build & push images Docker Hub (main uniquement)
    │       └── Mirror automatique → GitLab (develop + main)
    │
    └── GitLab (rendu école)
            └── GitLab CI (tests)
                    └── GitLab Runner sur Kubernetes (Helm)

VM École (172.16.248.98) — réseau privé VPN
    └── Kubernetes K3s
            ├── Namespace default
            │       ├── API (Node.js + Prisma)
            │       ├── Frontend (Vue.js + Vite)
            │       └── PostgreSQL 16
            ├── Namespace monitoring
            │       ├── Prometheus
            │       ├── Grafana
            │       ├── Loki + Promtail
            │       └── Alertmanager
            ├── Namespace gitlab
            │       └── GitLab Runner
            └── Namespace storage
                    └── MinIO (S3)
```

---

## 3. Step 1 — Environnement de développement

### 3.1 Docker Compose

L'environnement local repose sur Docker Compose avec 4 services :

```yaml
services:
  api:       # Node.js + Prisma — port 3000
  db:        # PostgreSQL 16 — port 5432
  pgadmin:   # Interface BDD (bonus) — port 5050
  frontend:  # Vue.js + Vite — port 5173
```

Lancer l'environnement local :

```bash
git checkout develop
git pull
docker compose up -d --build
```

Services disponibles en local :

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| pgAdmin | http://localhost:5050 |

### 3.2 Git Flow

Stratégie de branches adoptée :

```
main          → Production (stable)
  └── develop → Intégration (branche principale de travail)
        └── feature/*  → Développement de fonctionnalités
```

Chaque fonctionnalité part de `develop` et y revient via Pull Request après review.

### 3.3 Double remote

Le repository est synchronisé sur deux remotes :

```bash
git remote -v
# origin    git@github.com:Kentonnnn/ETNAir.git
# gitlab    git@rendu-git.etna-alternance.net:...
```

Le mirror GitHub → GitLab est automatisé via GitHub Actions (cf. section 5.3).

---

## 4. Step 2 — Déploiement Kubernetes

### 4.1 Installation K3s

K3s est une distribution légère de Kubernetes, adaptée à une VM avec ressources limitées. Il intègre nativement Traefik comme Ingress Controller.

```bash
curl -sfL https://get.k3s.io | sh -
```

### 4.2 Structure des fichiers Kubernetes

```
k8s/
├── api-deployment.yml         # Déploiement API (limites CPU/RAM incluses)
├── api-service.yml            # Service API (ClusterIP)
├── frontend-deployment.yml    # Déploiement Frontend (limites CPU/RAM incluses)
├── frontend-service.yml       # Service Frontend (ClusterIP)
├── postgres-deployment.yml    # Déploiement PostgreSQL (limites CPU/RAM incluses)
├── postgres-service.yml       # Service PostgreSQL
├── ingress.yml                # Ingress Traefik (TLS)
├── hpa.yml                    # Horizontal Pod Autoscaler
└── backup-cronjob.yml         # CronJob backup PostgreSQL (2h00 quotidien)
```

### 4.3 Ingress Traefik

Traefik expose les services via HTTPS :

```
https://172.16.248.98/       → Frontend (Vue.js)
https://172.16.248.98/api    → API (Node.js)
```

### 4.4 Secrets Kubernetes

Les credentials sensibles sont stockés dans un Secret Kubernetes `etnair-secrets` :

```bash
kubectl create secret generic etnair-secrets \
  --from-literal=POSTGRES_USER=... \
  --from-literal=POSTGRES_PASSWORD=... \
  --from-literal=POSTGRES_DB=... \
  --from-literal=JWT_SECRET=...
```

### 4.5 MinIO (Stockage S3)

MinIO est déployé via Helm dans le namespace `storage` pour le stockage des images des annonces, compatible avec l'API S3 d'AWS.

### 4.6 URLs des services

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | https://172.16.248.98 | HTTPS avec cert auto-signé |
| API | https://172.16.248.98/api | HTTPS avec cert auto-signé |
| Swagger | http://172.16.248.98:32493/api-docs | HTTP |
| Grafana | http://172.16.248.98:30692 | HTTP |
| pgAdmin | http://172.16.248.98:5050 | HTTP |

> **Note :** Tous les services sont sur réseau privé école. VPN requis depuis l'extérieur. Le navigateur affichera un avertissement certificat pour le HTTPS — cliquer sur « Paramètres avancés » → « Continuer ».

---

## 5. Step 3 — CI/CD + GitLab Runner

### 5.1 GitHub Actions

Fichier : `.github/workflows/deploy.yml`

| Branche | Job `test` | Job `deploy` |
|---------|------------|--------------|
| `develop` | ✅ | ❌ |
| `main` | ✅ | ✅ |

**Job `test` :** Installation npm + exécution des tests Jest  
**Job `deploy` :** Build image Docker + push Docker Hub + `kubectl apply`

### 5.2 GitLab CI

Fichier : `.gitlab-ci.yml`

```yaml
test:
  stage: test
  image: node:24-alpine
  cache:
    key: develop-protected
    paths:
      - api/node_modules/
  script:
    - cd api && npm install && npm test || true
```

Le cache npm réduit le temps d'exécution de ~20 min à quelques secondes après le premier run.

### 5.3 Mirror GitHub → GitLab

Fichier : `.github/workflows/mirror-to-gitlab.yml`

À chaque push sur `develop` ou `main`, le code est automatiquement synchronisé sur GitLab via Deploy Key SSH. Plus besoin de pusher manuellement sur les deux remotes.

### 5.4 GitLab Runner sur Kubernetes

Le GitLab Runner est déployé via Helm dans le namespace `gitlab` :

```bash
helm install gitlab-runner gitlab/gitlab-runner \
  --namespace gitlab \
  --set gitlabUrl=https://rendu-git.etna-alternance.net \
  --set runnerToken=<TOKEN>
```

### 5.5 Variables CI/CD

| Variable | Description |
|----------|-------------|
| `DOCKER_USERNAME` | Username Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub |
| `KUBECONFIG` | Config de connexion au cluster K3s (base64) |

---

## 6. Step 4 — Monitoring & Scalabilité

### 6.1 Stack monitoring

| Composant | Rôle |
|-----------|------|
| Prometheus | Collecte les métriques des pods et du cluster |
| Grafana | Visualisation des métriques et des logs |
| Loki | Agrégation des logs de tous les pods |
| Promtail | Agent de collecte des logs (DaemonSet) |
| Alertmanager | Gestion et routage des alertes |

### 6.2 Dashboards Grafana

URL : `http://172.16.248.98:30692`

| Dashboard | Description |
|-----------|-------------|
| Kubernetes / Compute Resources / Cluster | CPU et RAM globaux du cluster |
| Kubernetes / Compute Resources / Pod | Métriques par pod |
| Kubernetes / Networking / Cluster | Trafic réseau |
| Node Exporter / Nodes | Métriques du serveur (disk, CPU, RAM) |
| Loki Kubernetes Logs | Logs en temps réel |

### 6.3 Logs avec Loki

Les logs de tous les pods sont collectés par Promtail et envoyés à Loki.

Requêtes utiles dans Grafana → Explore → Loki :

```
{namespace="default"}       # Logs API + Frontend + PostgreSQL
{namespace="monitoring"}    # Logs Prometheus, Grafana, Loki
{namespace="gitlab"}        # Logs GitLab Runner
```

### 6.4 Alertes Prometheus

Alertes configurées dans `monitoring-etnair-alerts.yaml` :

| Alerte | Condition | Sévérité |
|--------|-----------|----------|
| HighCPUUsage | CPU > 80% pendant 5 min | warning |
| HighMemoryUsage | RAM > 85% pendant 5 min | warning |
| PodDown | Pod non running depuis 2 min | critical |
| HighDiskUsage | Disk > 85% | warning |

### 6.5 HPA (Horizontal Pod Autoscaler)

```yaml
# k8s/hpa.yml
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

Le HPA scale automatiquement les pods API et Frontend si le CPU dépasse 70%.

---

## 7. Step 5 — Finalisation

### 7.1 TLS/HTTPS avec cert-manager

L'exposition HTTPS est assurée par cert-manager avec un certificat auto-signé. Let's Encrypt est impossible sur une IP privée (pas de domaine public).

Flux d'une requête HTTPS :

```
Navigateur → Traefik Ingress (TLS termination) → cert-manager → Pod
```

Le certificat est généré et renouvelé automatiquement par cert-manager via Helm.

### 7.2 Tests de charge K6

Fichier : `k6/load-test.js`

**Configuration :**
- 10 utilisateurs virtuels simultanés (VUs)
- Durée : 2 minutes
- Scénarios : Frontend + API `/annonces`

**Résultats :**

```
✓ Frontend status 200     — 100%
✓ Frontend time < 500ms   — 100%
✓ Annonces status 200     — 100%
✓ Annonces time < 1000ms  — 100%

http_req_duration : avg=8.72ms  p(95)=16.04ms
http_req_failed   : 0.00%
checks_succeeded  : 100% (1836/1836)
```

### 7.3 Optimisation des ressources (CPU/RAM limits)

Les limites et requests sont configurées sur tous les pods pour éviter la monopolisation des ressources :

| Pod | CPU request | CPU limit | RAM request | RAM limit |
|-----|-------------|-----------|-------------|-----------|
| api | 125m | 500m | 256Mi | 512Mi |
| frontend | 100m | 200m | 128Mi | 256Mi |
| postgresql | 125m | 250m | 256Mi | 512Mi |

### 7.4 Backup PostgreSQL (CronJob)

Un CronJob Kubernetes effectue un `pg_dump` automatique toutes les nuits à 2h00 :

```yaml
# k8s/backup-cronjob.yml
spec:
  schedule: "0 2 * * *"   # Tous les jours à 2h00
```

Les backups sont sauvegardés dans `/var/backups/etnair/` sur le nœud, avec un nommage horodaté :

```
etnair-20260529-020000.sql
```

### 7.5 Tests de résilience

Test effectué : suppression d'un pod en live → Kubernetes recrée automatiquement le pod en moins de 30 secondes sans intervention manuelle ni interruption de service.

```bash
kubectl delete pod frontend-xxx
# → Kubernetes crée immédiatement un pod de remplacement
kubectl get pods -w
# NAME                      READY   STATUS    AGE
# frontend-new-xxx          1/1     Running   15s
```

### 7.6 Seed de la base de données

La BDD est alimentée avec des données de test générées via **Faker** :
- 10 utilisateurs
- 18 annonces avec images, prix, localisations

---

## 8. Accès aux services

| Service | URL | Protocole | Notes |
|---------|-----|-----------|-------|
| Frontend | https://172.16.248.98 | HTTPS | Certificat auto-signé |
| API | https://172.16.248.98/api | HTTPS | Certificat auto-signé |
| Swagger | http://172.16.248.98:32493/api-docs | HTTP | |
| Grafana | http://172.16.248.98:30692 | HTTP | admin / prom-operator |
| pgAdmin | http://172.16.248.98:5050 | HTTP | |
| MinIO | Interne cluster | - | Namespace storage |

> Tous les services nécessitent le VPN école depuis l'extérieur.

---

## 9. Résumé des technologies

| Technologie | Usage | Version |
|-------------|-------|---------|
| Kubernetes K3s | Orchestration | v1.35 |
| Docker | Conteneurisation | 24+ |
| Traefik | Reverse proxy / Ingress | v2 |
| cert-manager | Certificats TLS | - |
| PostgreSQL | Base de données | 16 |
| Prisma | ORM | 7.x |
| Prometheus | Métriques | - |
| Grafana | Visualisation | 11.x |
| Loki | Logs | 3.x |
| Promtail | Collecte logs | 3.x |
| MinIO | Stockage S3 | - |
| GitLab Runner | CI/CD | 18.x |
| Helm | Gestionnaire packages K8s | 3.x |
| K6 | Tests de charge | - |
| cert-manager | TLS/HTTPS auto-signé | - |
