import {
  AnswerFilter,
  CachedOkcAccount,
  DumbOkcAccount,
  login,
  okcAccount,
  OkcAccount,
  Payload,
} from './okcClient'
import ttlCache from '../services/ttlCache'

const USER_SESSION_CACHE_KEY = 'userSession'
const delay = (ms: 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class Profile {
  private readonly _payload: Payload
  lastLogin: string
  age: number
  displayName: string
  userId: string
  distance: string

  constructor(profileResp: Payload) {
    this._payload = profileResp

    const userData = profileResp.user
    this.age = userData.userinfo.age
    this.displayName = userData.userinfo.displayname
    this.userId = userData.userid
    this.lastLogin = this._payload.extras.lastOnlineString
    const location = userData.location.formatted
    const distance = Math.round(location.distance * 1.6)
    this.distance = `${location.standard}, ${distance} km`
  }

  payload() {
    return this._payload
  }
}

class OkcService {
  okc: DumbOkcAccount | CachedOkcAccount

  constructor(okc: OkcAccount) {
    this.okc = okc
  }

  bypassCache(bypass = false): OkcService {
    if (this.okc instanceof DumbOkcAccount) {
      return this
    } else {
      return new OkcService(this.okc.bypass(bypass))
    }
  }

  refreshSession(username: string, password: string): Promise<void> {
    return login(username, password).then(userSession => {
      ttlCache.setItem(USER_SESSION_CACHE_KEY, userSession, 360)
      this.okc = okcAccount(userSession)
    })
  }
  async getProfile(userId: string): Promise<Profile> {
    return this.okc
      .getUserProfile(userId)
      .then(payload => new Profile(payload))
  }

  async getProfiles(userIds: string[]): Promise<Profile[]> {
    const allProfileReqs = userIds.map(userId =>
      this.okc.getUserProfile(userId),
    )

    return Promise.all(allProfileReqs).then(profilePayloads =>
      profilePayloads
        .filter(payload => Object.keys(payload).length !== 0)
        .map(payload => new Profile(payload)),
    )
  }

  getAllPrivates(targetId: string): Promise<Payload> {
    return this.getAnswers(targetId, AnswerFilter.PUBLIC)
  }

  async answerFindOuts(
    targetId: string,
    holdOn = 1000,
  ): Promise<Payload> {
    const response = await this.getAnswers(
      targetId,
      AnswerFilter.FIND_OUT,
    )

    let successfulCount = 0
    for (const { question } of response.data) {
      await this.okc.answer(question.id)
      await delay(1000)
      successfulCount++
    }

    return Promise.resolve({ answeredQuestions: successfulCount })
  }

  private async getAnswers(
    userId: string,
    filter: AnswerFilter,
  ): Promise<Payload> {
    let after = undefined
    let end = false
    const finalPayload: Payload = {
      data: [],
      paging: {},
    }

    do {
      const response: Payload = await this.okc.getAnswers(
        userId,
        filter,
        { after: after },
      )
      finalPayload.data.push(...response.data)
      finalPayload.paging = response.paging

      after = response.paging.cursors.after
      end = response.paging.end
    } while (after && !end)

    return finalPayload
  }
}

const cachedUserSession = ttlCache.getItem(USER_SESSION_CACHE_KEY)
const botOkcService = cachedUserSession
  ? new OkcService(okcAccount(cachedUserSession))
  : new OkcService(new DumbOkcAccount())

export { botOkcService }
