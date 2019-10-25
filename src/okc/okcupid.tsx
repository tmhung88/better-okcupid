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
}

type UserSession = {
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

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type LoginApi = (
  username: string,
  password: string,
) => Promise<UserSession>

interface OkcAccount {
  getAccountId(): string
  getUserProfile(userId: string): Promise<Payload>
  getAnswers(
    userId: string,
    filter?: AnswerFilter,
    pageOpt?: PagingOpt,
  ): Promise<Payload>
  answer(questionId: number): Promise<Payload>
}

class CachedOkcAccount implements OkcAccount {
  private account: OkcAccount
  private _db: Dexie
  constructor(okcupid: OkcAccount, db: Dexie) {
    this.account = okcupid
    this._db = db
  }
  getAccountId(): string {
    return this.account.getAccountId()
  }

  async getUserProfile(userId: string): Promise<Payload> {
    const doc = await this._db.table('profiles').get(userId)
    if (doc) {
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
    if (doc) {
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
    if (doc) {
      return doc.response
    }
    return this.account.answer(questionId).then(response => {
      this._db
        .table('answered_questions')
        .put({ id: docId, response })
      return response
    })
  }
}

class UserOkcAccount implements OkcAccount {
  session: UserSession
  axiosInst: AxiosInstance

  constructor(loginResp: UserSession) {
    this.session = loginResp
    this.axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${loginResp.oauthToken}`,
        ...anonymousHeaders,
      },
      withCredentials: true,
    })
  }

  getAccountId(): string {
    return this.session.userId
  }

  getUserProfile(userId: string): Promise<Payload> {
    db.table('profiles')
      .get('123')
      .then(data => console.log('data', data))

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
}

class OkcService {
  okc: OkcAccount

  constructor(okc: OkcAccount) {
    this.okc = okc
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
      await delay(holdOn)
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

const cachedLogin: LoginApi = async (
  username: string,
  password: string,
): Promise<UserSession> => {
  const doc = await db.table('sessions').get(username)
  if (doc) {
    return doc.response
  }
  return login(username, password).then(userSession => {
    db.table('sessions').put({ id: username, response: userSession })
    return userSession
  })
}

const okcAccount = (
  username: string,
  password: string,
): Promise<OkcAccount> => {
  return cachedLogin(username, password).then(
    loginResp =>
      new CachedOkcAccount(new UserOkcAccount(loginResp), db),
  )
}

export { okcAccount, AnswerFilter, OkcService }
