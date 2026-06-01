import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  insecureSkipTLSVerify: true,
};

export default function () {
  const frontend = http.get('https://172.16.248.98/');
  check(frontend, {
    'Frontend status 200': (r) => r.status === 200,
    'Frontend time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  const annonces = http.get('https://172.16.248.98/api/annonces');
  check(annonces, {
    'Annonces status 200': (r) => r.status === 200,
    'Annonces time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}