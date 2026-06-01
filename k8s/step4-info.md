# Step 4 - Infrastructure Avancée

## Reverse Proxy - Traefik Ingress

- Traefik installé automatiquement par K3s
- Ingress configuré pour router les requêtes
- Middleware pour supprimer le préfixe `/api`

| URL | Service |
|-----|---------|
| http://172.16.248.98/api | API Backend |
| http://172.16.248.98/ | Frontend (en attente) |

## Tests de charge - K6

- 50 utilisateurs simultanés pendant 30 secondes
- 100% des checks passent
- ~49 requêtes/seconde
- Temps de réponse moyen : 17ms

## Autoscaling - HPA

| Paramètre | Valeur |
|-----------|--------|
| minReplicas | 1 |
| maxReplicas | 5 |
| CPU trigger | 70% |

## Monitoring - Grafana

- Dashboards Kubernetes disponibles
- Alerte CPU configurée (seuil 80%)
- Contact point ETNAir-alerts configuré

## Logging - Loki

- Loki installé mais incompatibilité de version avec Grafana v11
- À mettre à jour quand une version compatible sera disponible