import axios, { AxiosInstance } from 'axios'

const prepareUrls = (mock: true) => {
  const route = mock ? '/mock' : '/okc'
  return {
    login: `${route}/login`,
    userProfile: (userId: string): string => {
      return `${route}/1/apitun/profile/${userId}`
    },
    getAnswers: (userId: string): string => {
      return `${route}/1/apitun/profile/${userId}/answers`
    },
  }
}
const URLS = prepareUrls(true)

type UserSession = {
  oauthToken: string
  userId: string
  cookie: string
}
type Response = {
  [key: string]: any
}

const anonymousHeaders = {
  'x-okcupid-platform': 'DESKTOP',
}

const login = (
  username: string,
  password: string,
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

export class Profile {
  profileResp: Response
  lastLogin: string
  age: number
  displayName: string
  userId: string
  distance: string

  constructor(profileResp: Response) {
    this.profileResp = profileResp

    const userData = profileResp.user
    this.age = userData.userinfo.age
    this.displayName = userData.userinfo.displayname
    this.userId = userData.userId
    this.lastLogin = this.profileResp.extras.lastOnlineString
    const location = userData.location.formatted
    const distance = Math.round(location.distance * 1.6)
    this.distance = `${location.standard}, ${distance} km`
  }
}

export class Okcupid {
  loginResp: UserSession
  axiosInst: AxiosInstance

  constructor(loginResp: UserSession) {
    this.loginResp = loginResp
    this.axiosInst = axios.create({
      headers: {
        Authorization: `Bearer ${loginResp.oauthToken}`,
        ...anonymousHeaders,
      },
      withCredentials: true,
    })
  }

  getUserProfile(userId: string): Promise<Profile> {
    return this.axiosInst
      .get(URLS.userProfile(userId))
      .then(response => {
        return new Profile(response.data)
      })
  }

  getAnswers(userId: string): Promise<Response> {
    return this.axiosInst
      .get(URLS.getAnswers(userId))
      .then(resp => resp.data)
  }

  static create(
    username: string,
    password: string,
  ): Promise<Okcupid> {
    return login(username, password).then(
      loginResp => new Okcupid(loginResp),
    )
  }
}
