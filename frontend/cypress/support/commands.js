// Login via API directement (plus rapide que passer par l'UI à chaque test)
Cypress.Commands.add('login', (email = 'owner@test.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email, password },
      failOnStatusCode: false,
    }).then(({ body }) => {
      if (body.token) {
        window.localStorage.setItem('etnair_token', body.token)
        window.localStorage.setItem('etnair_user', JSON.stringify(body.user))
      }
    })
  })
})

// Nettoyer la session
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
})

// Intercepter les appels API courants avec des fixtures
Cypress.Commands.add('mockListings', () => {
  cy.intercept('GET', '/api/annonces*', { fixture: 'listings.json' }).as('getListings')
})

Cypress.Commands.add('mockListing', (id = 1) => {
  cy.intercept('GET', `/api/annonces/${id}`, { fixture: 'listing.json' }).as('getListing')
})

Cypress.Commands.add('mockFavorites', () => {
  cy.intercept('GET', '/api/favoris', { fixture: 'favorites.json' }).as('getFavorites')
  cy.intercept('GET', '/api/favoris/ids', { body: { favoriteIds: [1] } }).as('getFavoriteIds')
})
