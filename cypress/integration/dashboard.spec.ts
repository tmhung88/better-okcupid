import { CacheItem } from '../support/commands'

describe('Dashboard', () => {
  describe('Login', () => {
    beforeEach(() => {
      cy.server()
    })
    it('When there is no credentials/token cached, users are asked to input', () => {
      cy.clearAppCache(CacheItem.Token)
      cy.clearAppCache(CacheItem.Credentials)
      cy.visit('/')
      cy.step('Login with wrong credentials')
      cy.route({
        method: 'POST',
        url: '/okc/login',
        status: 200,
        response: 'fixture:login/failed_login.json',
      }).as('failed_login')
      cy.get('[data-cy=username]').type('login@test.com')
      cy.get('[data-cy=password]').type('wrong_password')
      cy.get('[data-cy=save]').click()
      cy.get('p.MuiTypography-colorError')
        .contains('104. That email or password is incorrect.')
        .should('be.visible')
      cy.step('Login with correct credentials')
      cy.route({
        method: 'POST',
        url: '/okc/login',
        status: 200,
        response: 'fixture:login/successful_login.json',
      }).as('successful_login')

      cy.get('[data-cy=password]')
        .clear()
        .type('correct_password')
      cy.get('[data-cy=save]').click()
      cy.get('p.MuiTypography-colorError').should('not.exist')

      cy.step('Ready to bookmark users')
      cy.get('[data-cy=profile-link]').should('be.visible')
    })

    it('When cached credentials are invalid , users can input new credentials', () => {
      const credentials = { username: 'cached_login@test.com', password: 'cached_password' }
      cy.setAppCache(CacheItem.Credentials, credentials)
      cy.route({
        method: 'POST',
        url: '/okc/login',
        status: 200,
        response: 'fixture:login/failed_login.json',
      }).as('failed_login')
      cy.visit('/')

      cy.step('Cached password, username are shown')
      cy.get('[data-cy=username]').should('have.value', credentials.username)
      cy.get('[data-cy=password]').should('have.value', credentials.password)
      cy.get('p.MuiTypography-colorError')
        .contains('104. That email or password is incorrect.')
        .should('be.visible')

      cy.route({
        method: 'POST',
        url: '/okc/login',
        status: 200,
        response: 'fixture:login/successful_login.json',
      }).as('successful_login')
      cy.get('[data-cy=username]')
        .clear()
        .type('new_login@test.com')
      cy.get('[data-cy=password]')
        .clear()
        .type('new_password')
      cy.get('[data-cy=save]').click()

      cy.step('Ready to bookmark users')
      cy.get('[data-cy=profile-link]').should('be.visible')
    })
  })
})
