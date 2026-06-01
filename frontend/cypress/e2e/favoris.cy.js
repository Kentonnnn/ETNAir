const USER = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@test.com', role: 'tenant' }

function setSession() {
  window.localStorage.setItem('etnair_token', 'fake-jwt-token')
  window.localStorage.setItem('etnair_user', JSON.stringify(USER))
}

describe('Favoris', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/favoris/ids', { body: { favoriteIds: [1] } }).as('getFavIds')
  })

  describe('Page /favoris', () => {
    it('affiche les annonces favorites', () => {
      cy.mockFavorites()
      setSession()
      cy.visit('/favoris')
      cy.wait('@getFavorites')
      cy.contains('Studio meublé Paris 11e').should('be.visible')
    })

    it('affiche un message si aucun favori', () => {
      cy.intercept('GET', '/api/favoris', { body: { listings: [] } }).as('emptyFavs')
      setSession()
      cy.visit('/favoris')
      cy.wait('@emptyFavs')
      cy.contains('Aucun favori').should('be.visible')
    })

    it('redirige vers /login si non connecté', () => {
      cy.clearLocalStorage()
      cy.visit('/favoris')
      cy.url().should('include', '/login')
    })
  })

  describe('Ajout aux favoris', () => {
    it('ajoute une annonce aux favoris depuis la liste', () => {
      cy.intercept('GET', '/api/annonces*', { fixture: 'listings.json' }).as('getListings')
      cy.intercept('POST', '/api/favoris/1', { body: { message: 'Ajouté aux favoris' } }).as('addFav')

      setSession()
      cy.visit('/annonces')
      cy.wait('@getListings')
      // Le bouton cœur est visible sur la carte (utilisateur connecté)
      cy.get('.fav-btn').first().click()
      cy.wait('@addFav')
    })

    it('retire une annonce des favoris', () => {
      cy.intercept('GET', '/api/annonces*', { fixture: 'listings.json' }).as('getListings')
      cy.intercept('DELETE', '/api/favoris/1', { body: { message: 'Retiré des favoris' } }).as('removeFav')

      setSession()
      cy.visit('/annonces')
      cy.wait('@getListings')
      // L'annonce id:1 est déjà en favori (favoriteIds: [1])
      cy.get('.fav-btn.active').first().click()
      cy.wait('@removeFav')
    })
  })
})
