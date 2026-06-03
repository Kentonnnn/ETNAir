const OWNER = { id: 1, firstName: 'Test', lastName: 'Owner', email: 'owner@test.com', role: 'owner' }

function setOwnerSession() {
  window.localStorage.setItem('etnair_token', 'fake-jwt-token')
  window.localStorage.setItem('etnair_user', JSON.stringify(OWNER))
}

describe('Dashboard', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/utilisateurs/1', {
      body: {
        user: {
          ...OWNER,
          listings: [
            { id: 1, title: 'Mon appart Paris', city: 'Paris', pricePerNight: 75, images: [] },
          ],
        },
      },
    }).as('getUser')

    cy.intercept('GET', '/api/favoris/ids', { body: { favoriteIds: [] } }).as('getFavIds')
    cy.intercept('GET', '/api/favoris', { body: { listings: [] } }).as('getFavs')
  })

  it('affiche le tableau de bord d\'un propriétaire', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Mon tableau de bord').should('be.visible')
    cy.contains('Mes annonces').should('be.visible')
  })

  it('affiche les annonces publiées', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Mon appart Paris').should('be.visible')
  })

  it('affiche l\'onglet Mes favoris', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.contains('Mes favoris').should('be.visible')
  })

  it('affiche l\'onglet Mon profil', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.contains('Mon profil').click()
    cy.contains('owner@test.com').should('be.visible')
  })

  it('propose un bouton Modifier sur chaque annonce', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.wait('@getUser')
    cy.contains('Modifier').should('be.visible')
  })

  it('navigue vers la page de création d\'annonce', () => {
    setOwnerSession()
    cy.visit('/dashboard')
    cy.contains('Publier une annonce').click()
    cy.url().should('include', '/annonces/create')
  })

  describe('Suppression d\'annonce', () => {
    it('supprime une annonce après confirmation', () => {
      setOwnerSession()
      cy.intercept('DELETE', '/api/annonces/1', { body: { message: 'Listing deleted successfully' } }).as('deleteListing')

      cy.visit('/dashboard')
      cy.wait('@getUser')
      cy.contains('Supprimer').click()
      cy.on('window:confirm', () => true)
      cy.wait('@deleteListing')
    })
  })
})
