# Monitoring - Prometheus & Grafana

## Services déployés

| Service | Description | Port |
|---------|-------------|------|
| Prometheus | Collecte des métriques | - |
| Grafana | Visualisation des métriques | 30692 |

## Accès Grafana

- URL : http://172.16.248.98:30692
- Username : admin
- Password : voir avec l'admin infra

## Dashboards disponibles

- Kubernetes / Compute Resources / Cluster → CPU et mémoire du cluster
- Kubernetes / Compute Resources / Pod → métriques par pod
- Kubernetes / Networking / Cluster → trafic réseau

## Métriques surveillées

- CPU du cluster
- Mémoire utilisée
- Nombre de pods en cours d'exécution
- Trafic réseau entre les services