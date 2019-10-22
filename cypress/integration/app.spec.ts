describe('[App]', () => {
  it('[Home Page]', () => {
    cy.step('A link to the offical React website')
    cy.visit('/')
    cy.get('a[target=_blank]').contains('Learn React')
  })
})
