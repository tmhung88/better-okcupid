declare namespace Cypress {
  interface Chainable {
    step(message: string): Chainable<void>
  }
}

function attachCustomCommands(Cypress: Cypress.Cypress): void {
  Cypress.Commands.add('step', (message: string) => {
    Cypress.log({
      displayName: 'step',
      message: [`**${message}**`],
    })
  })
}

attachCustomCommands(Cypress)
