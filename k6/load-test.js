import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // montée à 10 utilisateurs
    { duration: '1m', target: 10 },   // maintien à 10 utilisateurs
    { duration: '30s', target: 0 },   // descente à 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes < 500ms
    http_req_failed: ['rate<0.01'],   // moins de 1% d'erreurs
  },
};

export default function () {
  // Test de la santé de l'API
  const health = http.get('http://172.16.248.98/api/health');
  check(health, {
    'API health status 200': (r) => r.status === 200,
    'API health time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test de la liste des annonces
  const annonces = http.get('http://172.16.248.98/api/listings');
  check(annonces, {
    'Listings status 200': (r) => r.status === 200,
    'Listings time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}