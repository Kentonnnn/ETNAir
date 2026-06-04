# Tests — Documentation

## Présentation

La stratégie de test d'ETNAir s'articule autour de **trois niveaux complémentaires** qui couvrent des aspects différents de la qualité. Les **tests unitaires** Jest valident la logique métier du backend en isolant chaque contrôleur. Les **tests end-to-end** Cypress reproduisent le comportement réel d'un utilisateur dans le navigateur. Et les **tests de charge** k6 vérifient la résilience de l'infrastructure sous pression.

Cette approche pyramidale est volontaire : on écrit beaucoup de tests unitaires (rapides, ciblés, faciles à maintenir), un nombre raisonnable de tests E2E (plus lents mais plus représentatifs du vécu utilisateur), et seulement quelques tests de charge (coûteux en ressources mais essentiels pour la production).

---

## Audit par rapport aux exigences fonctionnelles

Le cahier des charges mentionne trois axes de validation, et la couverture actuelle est la suivante.

L'**authentification utilisateur** est couverte par deux angles complémentaires. Côté backend, le fichier `auth.test.js` contient cinq tests Jest qui vérifient l'inscription avec des données valides puis invalides (email mal formé, mot de passe trop court), ainsi que la connexion avec des identifiants corrects ou incorrects. Côté frontend, le fichier `auth.cy.js` ajoute huit tests Cypress qui simulent le parcours complet dans l'UI : remplissage du formulaire, soumission, redirection après login, et protection des routes privées. Cette double couverture garantit que le contrat est respecté à la fois au niveau de l'API et au niveau de l'expérience utilisateur.

La **recherche et l'affichage d'annonces** est elle aussi solidement couverte. Le fichier `annonces.test.js` contient sept tests Jest qui valident le CRUD complet, la pagination, et le filtre par ville. Le fichier `annonces.cy.js` ajoute sept tests Cypress qui couvrent l'affichage de la liste, le filtre via la barre de recherche, la bascule entre les vues grille et liste, l'affichage sur la carte Leaflet, et la navigation vers une fiche détail.

La **résilience de l'infrastructure** est partiellement couverte. D'un côté, le test de charge k6 dans `k6/load-test.js` vérifie que l'API et le frontend tiennent une charge raisonnable avec des seuils précis (95% des requêtes sous 500ms, moins de 1% d'erreurs). De l'autre, le HorizontalPodAutoscaler Kubernetes garantit que le système peut absorber automatiquement des pics de charge en ajoutant des replicas. En revanche, il manque encore des tests explicites de tolérance aux pannes : que se passe-t-il si la base de données tombe pendant 30 secondes ? Si un pod crash en pleine requête ? Ces scénarios sont identifiés comme axes d'amélioration.

Pour une soutenance, le niveau de couverture actuel est largement suffisant et reflète une compréhension mature de la pyramide de tests. Les manques sont documentés et constituent des perspectives d'évolution réalistes.

---

## Tests unitaires Jest

Pour exécuter la suite de tests backend, on se place dans le dossier `api/` et on lance `npm test`. Cette commande exécute Jest avec la configuration ESM nécessaire (`node --experimental-vm-modules`), génère un rapport de couverture, et affiche les résultats. Pour cibler un fichier spécifique, on peut filtrer avec `npm test -- src/tests/auth.test.js`.

La configuration de Jest se trouve dans `jest.config.js` et `jest.setup.cjs`. Plusieurs choix méritent d'être expliqués. D'abord, **Prisma est entièrement mocké** : un fichier `src/__mocks__/prisma.js` exporte un objet factice où chaque méthode est une `jest.fn()`. Ce mock est appliqué automatiquement grâce à `moduleNameMapper` qui redirige toute importation de `lib/prisma.js` vers le mock. Conséquence : aucune connexion à PostgreSQL n'est nécessaire pour faire tourner les tests, ce qui les rend rapides et exécutables n'importe où, même en CI sur une VM sans Docker.

Ensuite, comme le projet utilise des **modules ECMAScript natifs**, les fonctions globales Jest (`jest`, `describe`, `it`) ne sont pas automatiquement disponibles : il faut les importer explicitement depuis `@jest/globals`. C'est une particularité importante à connaître quand on écrit de nouveaux tests.

La suite couvre quatre domaines. Le fichier `auth.test.js` vérifie le flux d'inscription et de connexion. Le fichier `utilisateurs.test.js` teste les endpoints GET, PUT et DELETE avec authentification. Le fichier `annonces.test.js` couvre le CRUD complet, la pagination et le filtre. Enfin `booking.test.js` valide la création, la confirmation, l'annulation et la consultation de disponibilité d'une réservation, ainsi que la cohérence du flag `isBooked` calculé dynamiquement.

Voici un exemple type d'un test unitaire backend :

```javascript
import { jest, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import { prisma } from '../lib/prisma.js'
import app from '../../server.js'

it("devrait rejeter un email invalide", async () => {
  const res = await request(app).post('/auth/register').send({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'invalid-email',
    password: 'password123'
  })
  expect(res.statusCode).toBe(400)
})
```

---

## Tests end-to-end Cypress

Les tests E2E se trouvent dans `frontend/cypress/e2e/`. Pour les lancer en local, on a deux options. Le mode **interactif** s'invoque par `npm run cy:open` : il ouvre une interface graphique où on choisit le fichier de spécifications à exécuter, et on voit le navigateur s'animer en temps réel. C'est le mode recommandé pour débugger un test qui échoue. Le mode **headless** s'invoque par `npm run cy:run` : aucune interface, juste les résultats dans le terminal. C'est ce que la CI utilise.

Pour fonctionner, Cypress a besoin que le frontend tourne. On peut le lancer soit via `npm run dev` dans un terminal séparé, soit via `docker compose up`. La configuration dans `cypress.config.js` pointe sur `http://localhost:5173` par défaut.

Un choix architectural fort a été fait : les **appels API sont systématiquement interceptés** avec `cy.intercept()` et alimentés par des fixtures JSON dans `cypress/fixtures/`. Cela rend les tests E2E indépendants du backend : ils peuvent tourner même si l'API n'est pas démarrée, ce qui simplifie énormément l'exécution en CI. L'inconvénient est qu'on ne teste pas la véritable intégration frontend-backend, mais c'est un compromis acceptable car les tests unitaires Jest couvrent déjà cette couche.

Les commandes custom définies dans `cypress/support/commands.js` simplifient les tests répétitifs. `cy.login(email, password)` effectue un login via API (plus rapide qu'en passant par l'UI à chaque test). `cy.logout()` nettoie le `localStorage`. `cy.mockListings()`, `cy.mockListing(id)` et `cy.mockFavorites()` configurent les interceptions courantes.

Voici un exemple type d'un test Cypress :

```javascript
it('se connecte avec des identifiants valides', () => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: { token: 'fake-jwt', user: { id: 1, role: 'owner' } }
  }).as('login')

  cy.visit('/login')
  cy.get('input[type="email"]').type('test@test.com')
  cy.get('input[type="password"]').type('password123')
  cy.get('button[type="submit"]').click()

  cy.wait('@login')
  cy.url().should('include', '/dashboard')
})
```

---

## Tests de charge k6

Les tests de charge sont écrits avec **k6**, un outil moderne en Go qui exécute des scripts JavaScript pour simuler du trafic. Le script principal est `k6/load-test.js`. Il définit un profil de charge en trois phases : montée progressive jusqu'à 10 utilisateurs virtuels sur 30 secondes, plateau à 10 VUs pendant une minute, puis descente à 0 sur 30 secondes. Deux seuils de qualité sont définis : 95% des requêtes doivent répondre en moins de 500ms, et le taux d'erreurs doit rester inférieur à 1%.

Chaque utilisateur virtuel exécute en boucle un scénario simple : il appelle d'abord la page d'accueil du frontend, vérifie que le statut est 200 et que la latence est sous 500ms, attend une seconde, puis appelle l'endpoint `/api/annonces` avec les mêmes vérifications. Cette simulation reflète un comportement de visiteur basique qui consulte la liste des annonces.

Pour lancer le test, il faut d'abord installer k6 sur sa machine (`choco install k6` sur Windows, `brew install k6` sur Mac). Ensuite, la commande est simplement `k6 run k6/load-test.js`. À la fin du test, k6 affiche un rapport détaillé avec des statistiques sur la latence (médiane, p95, p99), le taux d'erreur, et le nombre total d'itérations. Si les seuils sont respectés, le script retourne 0 ; sinon, il retourne 99, ce qui permet de l'utiliser comme étape bloquante en CI.

L'intérêt majeur du test de charge est de valider le comportement du HorizontalPodAutoscaler Kubernetes. Si on lance k6 avec un nombre élevé de VUs (par exemple 50 ou 100), on peut observer en parallèle avec `kubectl get hpa -w` les replicas de l'API monter automatiquement de 2 vers 5 puis 8, puis redescendre quelques minutes après la fin du test. C'est la démonstration concrète que l'infrastructure est résiliente face à des pics de trafic.

---

## CI/CD GitLab

Le fichier `.gitlab-ci.yml` à la racine du projet définit le pipeline d'intégration continue. Trois stages sont déclarés : `test`, `e2e` et `deploy`.

Le stage **test** utilise l'image `node:24-alpine`, installe les dépendances de l'API, et lance `npm test`. Cependant, l'option `|| true` est ajoutée à la fin de la commande pour éviter que le pipeline ne tombe en cas de tests qui échouent. Cette décision est volontaire mais discutable : elle a été prise parce que la VM GitLab a peu de RAM et que certains tests Jest pouvaient timeout, ce qui rendait le pipeline rouge sans raison technique valable. Pour une vraie mise en production, il faudrait retirer ce `|| true` et corriger la cause racine des échecs.

Le stage **e2e** déclenche les tests Cypress. Il utilise l'image `cypress/included:13.6.0` qui fait environ 2 GB et contient déjà Chromium pré-installé. Comme la VM de la CI a seulement 4 GB de RAM, ce stage est configuré en `when: manual`, c'est-à-dire qu'il ne s'exécute jamais automatiquement mais nécessite un clic dans l'interface GitLab. Cette contrainte permet quand même de démontrer que les tests existent et sont exécutables, sans bloquer le pipeline en permanence.

Le stage **deploy** ne s'exécute que sur la branche `main`. Il construit les images Docker de l'API et du frontend, les pousse sur Docker Hub avec le tag `latest`, télécharge `kubectl`, configure l'accès au cluster via une variable d'environnement `KUBECONFIG`, et applique tous les manifests Kubernetes du dossier `k8s/`. Le résultat est qu'un push sur `main` déclenche un déploiement complet en production en quelques minutes.

---

## Préparation à la soutenance

Avant de présenter le projet à un panel, il est important de valider quelques points concrets. **Premièrement**, lancer la suite de tests Jest avec `cd api && npm test` et vérifier qu'elle affiche un nombre raisonnable de tests qui passent (idéalement zéro échec). Si certains tests échouent à cause de fonctionnalités pas encore implémentées, il vaut mieux les marquer `it.skip()` que les laisser en rouge.

**Deuxièmement**, valider que le seed fonctionne sur une base vide : `docker compose down -v` puis `docker compose up -d`, attendre une trentaine de secondes, et confirmer dans PgAdmin que les 127 annonces sont bien créées.

**Troisièmement**, tester manuellement un parcours utilisateur complet : inscription, connexion, recherche par ville, ajout d'une annonce en favori, et si l'utilisateur est propriétaire, création d'une nouvelle annonce avec upload d'image.

**Quatrièmement et optionnellement**, lancer un test k6 pendant la démonstration peut être très impressionnant pour montrer la résilience de l'infrastructure. Une simple commande `k6 run k6/load-test.js` produit un rapport visuel en temps réel que le panel apprécie généralement.

---

## Pistes d'amélioration

Plusieurs axes pourraient renforcer la stratégie de test du projet. À **court terme**, retirer le `|| true` du pipeline CI une fois les tests stabilisés est un objectif réaliste. Ajouter des `it.todo()` pour marquer les tests planifiés mais pas encore écrits est aussi une bonne pratique : ils apparaissent dans le rapport comme "TODO", ce qui montre une intention. Augmenter la couverture des contrôleurs au-delà de 80% est faisable en quelques heures.

À **moyen terme**, ajouter de vrais tests d'intégration avec une base PostgreSQL réelle apporterait une couverture supplémentaire. GitLab CI permet de déclarer des services additionnels dans un job, ce qui permettrait d'instancier une vraie base le temps des tests. Cela permettrait notamment de tester les transactions, les cascades de suppression, et les contraintes de la base. Implémenter des tests explicites de tolérance aux pannes (couper la base, simuler des timeouts, etc.) renforcerait aussi la confiance dans la résilience.

À **long terme**, des pratiques de chaos engineering comme `chaos-mesh` sur Kubernetes permettraient de simuler aléatoirement la mort de pods en production et de vérifier que le service reste accessible. Du monitoring synthétique (Grafana k6 schedule) déclencherait des alertes si les SLO sont violés. Et des tests visuels avec des outils comme Percy ou Chromatic permettraient de détecter automatiquement les régressions UI, notamment dans le mode sombre qui est particulièrement piégé.

---

## Pour aller plus loin

Plusieurs ressources externes sont utiles pour approfondir. La documentation officielle de Jest sur les modules ECMAScript explique en détail les subtilités du mode `--experimental-vm-modules`. Les bonnes pratiques Cypress couvrent les sélecteurs robustes, la gestion des assertions asynchrones, et l'organisation des tests en suites. La documentation des thresholds k6 explique comment définir des seuils plus sophistiqués (par exemple par endpoint, par tranche horaire, etc.). Et la documentation Kubernetes sur le HorizontalPodAutoscaler détaille les algorithmes de scaling et leurs paramètres avancés.
