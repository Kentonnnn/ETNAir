describe('Authentification', () => {
  beforeEach(() => {
    cy.logout()
  })

  describe('Connexion', () => {
    it('affiche la page de connexion', () => {
      cy.visit('/login')
      cy.get('form').should('exist')
      cy.contains('Connexion').should('exist')
    })

    it('se connecte avec des identifiants valides', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@test.com', role: 'owner' },
        },
      }).as('login')

      cy.visit('/login')
      cy.get('input[type="email"]').type('test@test.com')
      cy.get('input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@login')
      cy.url().should('include', '/dashboard')
    })

    it('affiche une erreur avec des identifiants invalides', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' },
      }).as('loginFail')

      cy.visit('/login')
      cy.get('input[type="email"]').type('wrong@test.com')
      cy.get('input[type="password"]').type('badpassword')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginFail')
      cy.url().should('include', '/login')
    })
  })

  describe('Inscription', () => {
    it('affiche la page d\'inscription', () => {
      cy.visit('/register')
      cy.get('form').should('exist')
    })

    it('crée un compte avec succès', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          token: 'fake-jwt-token',
          user: { id: 2, firstName: 'New', lastName: 'User', email: 'new@test.com', role: 'tenant' },
        },
      }).as('register')

      cy.visit('/register')
      cy.get('input[name="firstName"], input[placeholder*="rénom"]').first().type('New')
      cy.get('input[name="lastName"], input[placeholder*="om"]').first().type('User')
      cy.get('input[type="email"]').type('new@test.com')
      cy.get('input[type="password"]').first().type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@register')
      cy.url().should('not.include', '/register')
    })
  })

  describe('Déconnexion', () => {
    it('redirige vers l\'accueil après déconnexion', () => {
      // Simuler un utilisateur connecté
      window.localStorage.setItem('etnair_token', 'fake-token')
      window.localStorage.setItem('etnair_user', JSON.stringify({
        id: 1, firstName: 'Test', lastName: 'User', email: 'test@test.com', role: 'tenant',
      }))

      cy.visit('/dashboard')
      cy.contains('Se déconnecter').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Accès protégé', () => {
    it('redirige vers /login si non connecté', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('redirige vers /login pour /favoris si non connecté', () => {
      cy.visit('/favoris')
      cy.url().should('include', '/login')
    })
  })
})
