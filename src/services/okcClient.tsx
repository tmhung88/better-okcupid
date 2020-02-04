/* eslint-disable @typescript-eslint/camelcase */
import axios, { AxiosInstance } from 'axios'
import db from '../db'
import Dexie from 'dexie'
import ttlCache from './ttlCache'
import { Answer } from './okcService'

const URLS = {
  login: `/okc/login`,
  userProfile: (userId: string): string => {
    return `/okc/1/apitun/profile/${userId}`
  },
  getMyAnswer: (questionId: number): string => {
    return `/okc/1/apitun/profile/me/questions/${questionId}`
  },
  getAnswers: (userId: string): string => {
    return `/okc/1/apitun/profile/${userId}/answers`
  },
  answerQuestion: (questionId: number) => {
    return `/okc/1/apitun/questions/${questionId}`
  },
  getQuestion(questionId: number) {
    return `/okc/1/apitun/questions/${questionId}`
  },
  graphql: '/okc/graphql',
}

export type UserSession = {
  oauthToken: string
  userId: string
  cookie: string
}

export type Payload = {
  [key: string]: any
}

type PagingOpt = {
  before?: string
  after?: string
}

enum AnswerFilter {
  /**
   * Get all public answers, inclduing all filters
   */
  PUBLIC = '1',
  PRIVATE = '2',
  IMPORTANT = '4',
  EXPLAIN = '8',
  AGREE = '9',
  DISAGREE = '10',
  /**
   * Get all missing questions
   */
  FIND_OUT = '11',
}

export type QuestionFilterStats = { [key in AnswerFilter]?: number }

const anonymousHeaders = {
  'x-okcupid-platform': 'DESKTOP',
}

type LoginApi = (username: string, password: string) => Promise<UserSession>

export interface OkcAccount {
  getAccountId(): string

  getUserProfile(userId: string): Promise<Payload>

  getMyAnswer(questionId: number): Promise<Payload>

  getAnswers(userId: string, filter?: AnswerFilter, pageOpt?: PagingOpt): Promise<Payload>

  answer(questionId: number): Promise<Payload>

  hideAnswer(answer: Answer): Promise<Payload>

  skipQuestion(questionId: number): Promise<Payload>

  getQuestion(questionId: number): Promise<Payload>

  getQuestionFilterStats(targetId: string): Promise<QuestionFilterStats>
}

class DumbOkcAccount implements OkcAccount {
  getAccountId(): string {
    return ''
  }

  getUserProfile(userId: string): Promise<Payload> {
    return Promise.resolve({})
  }

  answer(questionId: number): Promise<Payload> {
    return Promise.resolve({})
  }

  getMyAnswer(questionId: number): Promise<Payload> {
    return Promise.resolve({})
  }

  getAnswers(userId: string, filter?: AnswerFilter, pageOpt?: PagingOpt): Promise<Payload> {
    return Promise.resolve({})
  }

  hideAnswer(answer: Answer): Promise<Payload> {
    return Promise.resolve({})
  }

  getQuestion(questionId: number): Promise<Payload> {
    return Promise.resolve({})
  }

  getQuestionFilterStats(targetId: string): Promise<Payload> {
    return Promise.resolve({})
  }

  skipQuestion(questionId: number): Promise<Payload> {
    return Promise.resolve({})
  }
}

class CachedOkcAccount implements OkcAccount {
  account: OkcAccount
  _db: Dexie
  readonly _bypass: boolean

  constructor(account: OkcAccount, db: Dexie, bypass = false) {
    this.account = account
    this._db = db
    this._bypass = bypass
  }

  bypass(bypass = false): CachedOkcAccount {
    return new CachedOkcAccount(this.account, this._db, bypass)
  }

  getAccountId(): string {
    return this.account.getAccountId()
  }

  async getUserProfile(userId: string): Promise<Payload> {
    const doc = await this._db.table('profiles').get(userId)
    if (!this._bypass && doc) {
      return doc.response
    }

    return this.account.getUserProfile(userId).then(response => {
      this._db.table('profiles').put({ id: userId, response })
      return response
    })
  }

  getMyAnswer(questionId: number): Promise<Payload> {
    return this.account.getMyAnswer(questionId)
  }

  async getAnswers(userId: string, filter = AnswerFilter.AGREE, pageOpt: PagingOpt = {}): Promise<Payload> {
    let queryId = `${userId}|filter=${filter}`
    queryId = pageOpt.before ? `${queryId}|before=${pageOpt.before}` : queryId
    queryId = pageOpt.after ? `${queryId}|after=${pageOpt.after}` : queryId

    const doc = await this._db.table('answers').get(queryId)
    if (!this._bypass && doc) {
      return doc.response
    }
    return this.account.getAnswers(userId, filter, pageOpt).then(response => {
      this._db.table('answers').put({ id: queryId, response })
      return response
    })
  }

  async answer(questionId: number): Promise<Payload> {
    const docId = `${this.account.getAccountId()}|qid=${questionId}`
    const doc = await this._db.table('answered_questions').get(docId)
    if (!this._bypass && doc) {
      return doc.response
    }
    return this.account.answer(questionId).then(response => {
      this._db.table('answered_questions').put({ id: docId, response })
      return response
    })
  }

  hideAnswer(answer: Answer): Promise<Payload> {
    return this.account.hideAnswer(answer)
  }

  skipQuestion(questionId: number): Promise<Payload> {
    return this.account.skipQuestion(questionId)
  }

  async getQuestion(questionId: number): Promise<Payload> {
    const doc = await this._db.table('questions').get(questionId)
    if (!this._bypass && doc) {
      return doc.response
    }
    return this.account.getQuestion(questionId).then(response => {
      this._db.table('questions').put({ id: questionId, response })
      return response
    })
  }

  getQuestionFilterStats(targetId: string): Promise<QuestionFilterStats> {
    const key = `profile_questions_${this.getAccountId()}_${targetId}`
    const item = ttlCache.getItem(key)
    if (!this._bypass && item) {
      return Promise.resolve(item)
    }
    return this.account.getQuestionFilterStats(targetId).then(stats => {
      ttlCache.setItem(key, stats, 24 * 60 * 7)
      return stats
    })
  }
}

class UserOkcAccount implements OkcAccount {
  session: UserSession
  axiosInst: AxiosInstance

  constructor(userSession: UserSession) {
    this.session = userSession
    this.axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${userSession.oauthToken}`,
        ...anonymousHeaders,
      },
      withCredentials: true,
    })
  }

  getAccountId(): string {
    return this.session.userId
  }

  getUserProfile(userId: string): Promise<Payload> {
    return this.axiosInst.get(URLS.userProfile(userId)).then(response => response.data)
  }

  getMyAnswer(questionId: number): Promise<Payload> {
    return this.axiosInst.get(URLS.getMyAnswer(questionId)).then(response => response.data)
  }

  getAnswers(userId: string, filter: AnswerFilter.AGREE, pageOpt: PagingOpt): Promise<Payload> {
    const params = { filter, ...pageOpt }
    return this.axiosInst
      .get(URLS.getAnswers(userId), {
        params: params,
      })
      .then(resp => resp.data)
  }

  answer(questionId: number): Promise<Payload> {
    const payload = {
      qid: questionId,
      answer: 1,
      match_answers: [1],
      importance: 'SOMEWHAT',
      public: true,
      note: '',
      source: 'profile',
      get_formatted_response: true,
      target_userid: this.getAccountId(),
    }
    return this.axiosInst.post(URLS.answerQuestion(questionId), payload).then(response => response.data)
  }

  hideAnswer(answer: Answer): Promise<Payload> {
    const importanceMap: { [K: number]: string } = {
      3: 'SOMEWHAT',
      4: 'LITTLE',
      5: 'IRRELEVANT',
      1: 'VERY',
    }
    console.log('Answer', answer)
    console.log('Importance ', importanceMap[answer.payload.target.importance], answer.payload.target.importance)

    const payload = {
      qid: answer.question.id,
      answer: answer.answer,
      match_answers: answer.accepts,
      importance: importanceMap[answer.payload.target.importance],
      public: false,
      note: answer.note,
      source: 'profile',
      get_formatted_response: true,
      target_userid: this.getAccountId(),
    }
    return this.axiosInst.post(URLS.answerQuestion(answer.question.id), payload).then(response => response.data)
  }

  skipQuestion(questionId: number): Promise<Payload> {
    return this.axiosInst
      .post(URLS.answerQuestion(questionId), { skip: true, source: 'profile' })
      .then(response => response.data)
  }

  getQuestion(questionId: number): Promise<Payload> {
    return this.axiosInst.get(URLS.getQuestion(questionId)).then(response => response.data)
  }

  getQuestionFilterStats(targetId: string): Promise<QuestionFilterStats> {
    const payload = (userId: string, targetId: string) => {
      return `{"operationName":"matchProfileQuestionsEntry","variables":{"targetId":"${targetId}","viewerId":"${userId}"},"query":"query matchProfileQuestionsEntry($targetId: String!, $viewerId: String!) {\\n  user(id: $viewerId) {\\n    id\\n    primaryImage {\\n      square160\\n      __typename\\n    }\\n    match(id: $targetId) {\\n      matchPercent\\n      questionFilters {\\n        id\\n        count\\n        __typename\\n      }\\n      user {\\n        id\\n        username\\n        displayname\\n        primaryImage {\\n          square160\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`
    }
    return this.axiosInst
      .post(URLS.graphql, payload(this.getAccountId(), targetId), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        const stats: QuestionFilterStats = {}
        const questionFilters = response.data.data.user.match.questionFilters
        questionFilters.forEach((filter: any) => {
          stats[filter.id as AnswerFilter] = filter.count
        })
        return stats
      })
  }
}

type LoginResponse = {
  actionable: boolean
  status: number
  status_str: 0 | 104
  userid: string
  oauth_accesstoken?: string
}

const login: LoginApi = (username, password): Promise<UserSession> => {
  const cookie = 'session=12366432516965552599%3a16299680743430403858'
  document.cookie = cookie
  const params = new URLSearchParams()
  params.append('okc_api', String(1))
  params.append('username', username)
  params.append('password', password)
  return new Promise<UserSession>((resolve, reject) => {
    axios.post(URLS.login, params, { headers: anonymousHeaders }).then(response => {
      const loginResponse: LoginResponse = response.data
      if (loginResponse.oauth_accesstoken && loginResponse.status === 0) {
        resolve({
          oauthToken: loginResponse.oauth_accesstoken,
          userId: loginResponse.userid,
          cookie: cookie,
        })
      } else {
        reject({ status: loginResponse.status, reason: loginResponse.status_str })
      }
    })
  })
}

const okcAccount = (userSession: UserSession): OkcAccount => {
  return new CachedOkcAccount(new UserOkcAccount(userSession), db)
}

export { CachedOkcAccount, DumbOkcAccount, AnswerFilter, login, okcAccount }
