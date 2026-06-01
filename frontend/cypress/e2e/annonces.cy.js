describe('Annonces', () => {
  beforeEach(() => {
    cy.mockListings()
  })

  describe('Liste des annonces', () => {
    it('affiche les annonces', () => {
      cy.visit('/annonces')
      cy.wait('@getListings')
      cy.contains('Studio meublé Paris 11e').should('be.visible')
      cy.contains('Appartement lumineux Lyon').should('be.visible')
    })

    it('affiche le prix par nuit', () => {
      cy.visit('/annonces')
      cy.wait('@getListings')
      cy.contains('65').should('exist')
      cy.contains('/nuit').should('exist')
    })

    it('affiche les villes', () => {
      cy.visit('/annonces')
      cy.wait('@getListings')
      cy.contains('Paris').should('exist')
      cy.contains('Lyon').should('exist')
    })

    it('propose les vues liste, grille et carte', () => {
      cy.visit('/annonces')
      cy.wait('@getListings')
      // Les boutons de vue doivent exister
      cy.get('button').contains('⊞').should('exist')
      cy.get('button').contains('☰').should('exist')
    })
  })

  describe('Recherche et filtres', () => {
    it('filtre par ville', () => {
      cy.intercept('GET', '/api/annonces*city=Paris*', {
        body: {
          listings: [
            { id: 1, title: 'Studio meublé Paris 11e', city: 'Paris', pricePerNight: 65, images: [], owner: { id: 10, firstName: 'Marie', lastName: 'D', email: 'm@t.com' } }
          ],
          page: 1, limit: 10,
        },
      }).as('searchParis')

      cy.visit('/annonces?city=Paris')
      cy.wait('@searchParis')
      cy.contains('Studio meublé Paris 11e').should('be.visible')
      cy.contains('Appartement lumineux Lyon').should('not.exist')
    })
  })

  describe('Détail d\'une annonce', () => {
    it('navigue vers la page de détail', () => {
      cy.mockListing(1)
      cy.visit('/annonces')
      cy.wait('@getListings')
      cy.contains('Studio meublé Paris 11e').click()
      cy.wait('@getListing')
      cy.url().should('include', '/annonces/1')
    })

    it('affiche les informations de l\'annonce', () => {
      cy.mockListing(1)
      cy.visit('/annonces/1')
      cy.wait('@getListing')
      cy.contains('Studio meublé Paris 11e').should('be.visible')
      cy.contains('Paris').should('be.visible')
      cy.contains('65').should('exist')
    })

    it('affiche le propriétaire', () => {
      cy.mockListing(1)
      cy.visit('/annonces/1')
      cy.wait('@getListing')
      cy.contains('Marie').should('be.visible')
    })
  })
})
