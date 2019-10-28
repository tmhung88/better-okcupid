/* eslint-disable @typescript-eslint/camelcase */
import axios, { AxiosInstance } from 'axios'
import db from '../db'
import Dexie from 'dexie'

const URLS = {
  login: `/okc/login`,
  userProfile: (userId: string): string => {
    return `/okc/1/apitun/profile/${userId}`
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
  PUBLIC = 1,
  PRIVATE = 2,
  IMPORTANT = 4,
  EXPLAIN = 8,
  AGREE = 9,
  DISAGREE = 10,
  /**
   * Get all missing questions
   */
  FIND_OUT = 11,
}

const anonymousHeaders = {
  'x-okcupid-platform': 'DESKTOP',
}

type LoginApi = (
  username: string,
  password: string,
) => Promise<UserSession>

export interface OkcAccount {
  getAccountId(): string
  getUserProfile(userId: string): Promise<Payload>
  getAnswers(
    userId: string,
    filter?: AnswerFilter,
    pageOpt?: PagingOpt,
  ): Promise<Payload>
  answer(questionId: number): Promise<Payload>
  getQuestion(questionId: number): Promise<Payload>
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

  getAnswers(
    userId: string,
    filter?: AnswerFilter,
    pageOpt?: PagingOpt,
  ): Promise<Payload> {
    return Promise.resolve({})
  }

  getQuestion(questionId: number): Promise<Payload> {
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

  async getAnswers(
    userId: string,
    filter = AnswerFilter.AGREE,
    pageOpt: PagingOpt = {},
  ): Promise<Payload> {
    let queryId = `${userId}|filter=${filter}`
    queryId = pageOpt.before
      ? `${queryId}|before=${pageOpt.before}`
      : queryId
    queryId = pageOpt.after
      ? `${queryId}|after=${pageOpt.after}`
      : queryId

    const doc = await this._db.table('answers').get(queryId)
    if (!this._bypass && doc) {
      return doc.response
    }
    return this.account
      .getAnswers(userId, filter, pageOpt)
      .then(response => {
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
      this._db
        .table('answered_questions')
        .put({ id: docId, response })
      return response
    })
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
    return this.axiosInst
      .get(URLS.userProfile(userId))
      .then(response => response.data)
  }

  getAnswers(
    userId: string,
    filter: AnswerFilter.AGREE,
    pageOpt: PagingOpt,
  ): Promise<Payload> {
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
    return this.axiosInst
      .post(URLS.answerQuestion(questionId), payload)
      .then(response => response.data)
  }

  getQuestion(questionId: number): Promise<Payload> {
    return this.axiosInst
      .get(URLS.getQuestion(questionId))
      .then(response => response.data)
  }
}

const login: LoginApi = (
  username,
  password,
): Promise<UserSession> => {
  const cookie = 'session=12366432516965552599%3A16299680743430403858'
  document.cookie = cookie
  const params = new URLSearchParams()
  params.append('okc_api', String(1))
  params.append('username', username)
  params.append('password', password)
  return axios
    .post(URLS.login, params, { headers: anonymousHeaders })
    .then(response => {
      return {
        oauthToken: response.data.oauth_accesstoken,
        userId: response.data.userid,
        cookie: cookie,
      }
    })
}

const okcAccount = (userSession: UserSession): OkcAccount => {
  return new CachedOkcAccount(new UserOkcAccount(userSession), db)
}

export {
  CachedOkcAccount,
  DumbOkcAccount,
  AnswerFilter,
  login,
  okcAccount,
}
