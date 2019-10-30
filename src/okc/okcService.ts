import {
  AnswerFilter,
  CachedOkcAccount,
  DumbOkcAccount,
  login,
  okcAccount,
  OkcAccount,
  Payload,
  QuestionFilterStats,
  UserSession,
} from './okcClient'
import ttlCache from '../services/ttlCache'
import { delay } from '../services/utils'

const USER_SESSION_CACHE_KEY = 'userSession'

export enum Genre {
  dating = 'dating',
  ethics = 'ethics',
  lifestyle = 'lifestyle',
  other = 'other',
  religion = 'religion',
  sex = 'sex',
}

interface MetaPayload<T> {
  data: T
  paging: any
}

export type Question = {
  id: number
  genre: Genre
  text: string
  answers: string[]
}
class Answer {
  payload: Payload
  question: Question
  /**
   * Their answer
   */
  answer: number
  /**
   * Answers they want from you
   */
  accepts: number[]
  /**
   * A note explained on their choice
   */
  note: string
  constructor(payload: Payload) {
    this.payload = payload
    this.question = payload.question
    const target = payload.target
    this.answer = target.answer
    this.accepts = target.accepts
    this.note = target.note
  }

  answerChoice(): string {
    return this.question.answers[this.answer]
  }

  acceptChoices(): string[] {
    try {
      return this.accepts.map(accept => this.question.answers[accept])
    } catch (e) {
      return ['I want something']
    }
  }
}

/**
 * A photo url https://k1.okccdn.com/php/load_okc_image.php/images/50x0/806x756/0/5325329573026.webp?v=2
 * The pattern {image_size}/0/{image_id}.webp?v=2
 */
class Photo {
  payload: Payload
  id: string
  constructor(payload: Payload) {
    const photoUrl = payload.full
    this.payload = payload
    this.id = photoUrl.substring(photoUrl.indexOf('/0/') + '/0/'.length, photoUrl.lastIndexOf('.webp?v=2'))
  }

  cardUrl(): string {
    return `https://cdn.okccdn.com/php/load_okc_image.php/images/225x225/225x225/0x186/1127x1313/0/${this.id}.webp?v=2`
  }

  originalUrl(): string {
    return `https://cdn.okccdn.com/php/load_okc_image.php/images/0x186/1127x1313/0/${this.id}.webp?v=2`
  }
}

export class Profile {
  private readonly _payload: Payload
  lastLogin: string
  age: number
  displayName: string
  userId: string
  distance: string
  photos: Photo[]

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
    this.photos = userData.photos.map((payload: Payload) => new Photo(payload))
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

  getMyProfile(): Promise<Profile> {
    return this.okc.getUserProfile(this.okc.getAccountId()).then(payload => new Profile(payload))
  }

  getQuestion(questionId: number): Promise<Question> {
    return this.okc.getQuestion(questionId).then(payload => payload as Question)
  }

  getCurrentSession(): UserSession | null {
    return ttlCache.getItem(USER_SESSION_CACHE_KEY)
  }

  refreshSession(username: string, password: string): Promise<UserSession> {
    return login(username, password).then(userSession => {
      ttlCache.setItem(USER_SESSION_CACHE_KEY, userSession, 360)
      this.okc = okcAccount(userSession)
      return userSession
    })
  }

  getQuestionFilterStats(targetId: string): Promise<QuestionFilterStats> {
    return this.okc.getQuestionFilterStats(targetId)
  }

  async getProfile(userId: string): Promise<Profile> {
    return this.okc.getUserProfile(userId).then(payload => new Profile(payload))
  }

  async getProfiles(userIds: string[], waitInMs = 0): Promise<Profile[]> {
    const allProfileReqs = []
    userIds.map(userId => this.okc.getUserProfile(userId))
    for (const userId of userIds) {
      allProfileReqs.push(this.okc.getUserProfile(userId))
      await delay(waitInMs)
    }

    return Promise.all(allProfileReqs).then(profilePayloads =>
      profilePayloads.filter(payload => Object.keys(payload).length !== 0).map(payload => new Profile(payload)),
    )
  }

  getAllPublicAnswers(targetId: string): Promise<MetaPayload<Answer[]>> {
    return this.getAnswers(targetId, AnswerFilter.PUBLIC)
  }

  getAllFindOuts(targetId: string): Promise<MetaPayload<Answer[]>> {
    return this.getAnswers(targetId, AnswerFilter.FIND_OUT)
  }

  private async getAnswers(userId: string, filter: AnswerFilter): Promise<MetaPayload<Answer[]>> {
    let after = undefined
    let end = false
    const finalPayload: MetaPayload<Answer[]> = {
      data: [],
      paging: {},
    }

    do {
      const response: Payload = await this.okc.getAnswers(userId, filter, { after: after })
      finalPayload.data.push(...response.data.map((answer: any) => new Answer(answer)))
      if (finalPayload.data.length === 0) {
        return finalPayload
      }
      finalPayload.paging = response.paging
      after = response.paging.cursors.after
      end = response.paging.end
    } while (after && !end)

    return finalPayload
  }

  async answerQuestion(questionId: number) {
    return this.okc.answer(questionId)
  }
}

const cachedUserSession = ttlCache.getItem(USER_SESSION_CACHE_KEY)
const botOkcService = cachedUserSession
  ? new OkcService(okcAccount(cachedUserSession))
  : new OkcService(new DumbOkcAccount())

export { botOkcService, Answer }
