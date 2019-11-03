declare namespace Cypress {
  interface Chainable<T> {
    step(message: string): Chainable<void>
    clearAppCache(item: CacheItem): Chainable<void>
    setAppCache(item: CacheItem, values: CacheValues): Chainable<void>
  }
}

export enum CacheItem {
  Token = 'Access Token',
  Credentials = 'Credentials',
}

type CacheValues = {
  username?: string
  password?: string
  token?: string
  expiredAt?: Date
}

const clearCacheHandlers: { [Key in CacheItem]: () => void } = {
  [CacheItem.Token]: () => cy.clearLocalStorage('userSession'),
  [CacheItem.Credentials]: () => {
    cy.clearLocalStorage('username')
    cy.clearLocalStorage('password')
  },
}

const setCacheHandlers: { [Key in CacheItem]: (values: CacheValues) => void } = {
  [CacheItem.Token]: ({ token = '', expiredAt = new Date() }) => {
    localStorage.setItem('userSession', JSON.stringify({ value: { oauthToken: token, expiredAt: expiredAt.getTime } }))
  },
  [CacheItem.Credentials]: ({ username = '', password = '' }) => {
    localStorage.setItem('username', username)
    localStorage.setItem('password', password)
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
      consoleProps: () => {
        return { item }
      },
    })
    clearCacheHandlers[item]()
  })

  Cypress.Commands.add('setAppCache', (item: CacheItem, values: CacheValues) => {
    Cypress.log({
      displayName: 'SET_CACHE',
      consoleProps: () => {
        return { item, values }
      },
    })
    setCacheHandlers[item](values)
  })
}

attachCustomCommands(Cypress)
