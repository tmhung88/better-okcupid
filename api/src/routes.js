const Routes = require('koa-router')
const fs = require('fs')
const path = require('path')
const router = new Routes()

const getData = fileName => {
  const rawData = fs.readFileSync(
    path.resolve('data', `${fileName.toLocaleLowerCase()}`),
  )
  return JSON.parse(rawData)
}
const GET = router.get.bind(router)
const POST = router.post.bind(router)

const objHandler = resp => {
  return async ctx => {
    ctx.body = resp
  }
}
const fileHandler = (fileResolver) => {
  return async ctx => {
    ctx.body = getData(`${fileResolver(ctx.params)}.json`)
  }
}

const routeMapping = [
  [GET, '/', objHandler({ message: 'hello world' })],
  [POST, '/login', fileHandler(() => 'login')],
  [GET, '/1/apitun/profile/:id/', fileHandler((params) => params.id)],
  [GET, '/1/apitun/profile/:id/answers', fileHandler((params) => `answers-${params.id}`)],
]

routeMapping.forEach(mapping => {
  const [httpMethod, url, handler] = mapping
  httpMethod(url, handler)
})

module.exports = router
