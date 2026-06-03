# MinIO - Stockage d'objets ETNAir

## URLs
- Console (interface web) : http://172.16.248.98:31340
- API (pour les développeurs) : http://172.16.248.98:31580

## Bucket
- Nom : etnair-images

## Credentials développeurs
- Access Key : (remplace par ton Access Key)
- Secret Key : (remplace par ton Secret Key)

## Utilisation dans le code Node.js
npm install minio

const Minio = require('minio')
const minioClient = new Minio.Client({
  endPoint: '172.16.248.98',
  port: 31580,
  useSSL: false,
  accessKey: 'TON_ACCESS_KEY',
  secretKey: 'TON_SECRET_KEY'
})
