describe('[App]', () => {
  it('[Home Page]', () => {
    cy.step('Dashboard is loaded')
    cy.visit('/')
    cy.get('h1').contains('Dashboard')
    cy.get('a').contains('Your Website')
  })
})
