declare namespace Cypress {
  interface Chainable<T> {
    step(message: string): Chainable<void>
    clearAppCache(item: CacheItem): Chainable<void>
  }
}

export enum CacheItem {
  Token = 'Access Token',
  Credentials = 'Credentials',
}

const clearCacheHandlers: { [Key in CacheItem]: () => void } = {
  [CacheItem.Token]: () => cy.clearLocalStorage('userSession'),
  [CacheItem.Credentials]: () => {
    cy.clearLocalStorage('username')
    cy.clearLocalStorage('password')
  },
}
function attachCustomCommands(Cypress: Cypress.Cypress): void {
  Cypress.Commands.add('step', (message: string) => {
    Cypress.log({
      displayName: 'step',
      message: [`**${message}**`],
    })
  })
  Cypress.Commands.add('clearAppCache', (item: CacheItem) => {
    Cypress.log({
      displayName: 'CLEAR_CACHE',
      message: [`**${item}**`],
    })
    clearCacheHandlers[item]()
  })
}

attachCustomCommands(Cypress)
