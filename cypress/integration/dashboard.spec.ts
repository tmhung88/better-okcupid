import { CacheItem } from '../support/commands'

describe('Dashboard', () => {
  describe('Login', () => {
    beforeEach(() => {
      cy.server({
        delay: 1000,
      })
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
      cy.get('p.MuiTypography-colorError').contains('104. That email or password is incorrect.')
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
    })
  })
})
