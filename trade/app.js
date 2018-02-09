const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')
const LoginController = require('./controllers/LoginController.js')
const { sendCodeFromMail } = require('./libs/mailer.js')
const Koa = require('koa')
const koaRouter = require('koa-router')()
const koaBody = require('koa-body')
const jwt = require('jsonwebtoken')

const app = new Koa()
const port = 7007
const loginController = new LoginController()

// 配置存储session信息的mysql
let store = new MysqlSession({
  user: 'root',
  password: 'chenye8685800',
  database: 'trade',
  host: 'localhost',
})

// 存放sessionId的cookie配置
let cookie = {
  // maxAge: '', // cookie有效时长
  // expires: '',  // cookie失效时间
  // path: '', // 写cookie所在的路径
  // domain: '', // 写cookie所在的域名
  httpOnly: false, // 是否只用于http请求中获取
  overwrite: true,  // 是否允许重写
  // secure: '',
  // sameSite: '',
  // signed: ''
}

app.use(koaBody())

// 使用session中间件
app.use(session({
  key: 'SESSION_ID',
  store: store,
  cookie: cookie
}))

function geneToken (ctx) {
  let tempNum = uuid()
  let token = jwt.sign({ uid: tempNum }, 'id')
  ctx.cookies.set(
    'token',
    token,
    {
      domain: 'localhost', // 写cookie所在的域名
      path: '', // 写cookie所在的路径
      maxAge: 60 * 1000, // cookie有效时长
      // expires: new Date('2017-02-15'),  // cookie失效时间
      httpOnly: false, // 是否只用于http请求中获取
      overwrite: false // 是否允许重写
    }
  )
  ctx.cookies.set('uuid', tempNum, { httpOnly: false })
}

function uuid (a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

function checkToken (ctx) {
  return new Promise((resolve, reject) => {
    let uuid = ctx.cookies.get('uuid')
    let token = ctx.cookies.get('token')
    if (!token) reject(new Error('token is  null.'))
    jwt.verify(token, 'id', function (err, decoded) {
      if (err) reject(new Error(err))
      if (decoded.uid !== uuid) reject('token is out')
      resolve(decoded)
    })
  })
}

// 登陆
koaRouter.get('/userLogin', async (ctx) => {
  let res = loginController.userLogin(ctx)
  let response = null
  await res.then((v) => {
    response = v
  })
  ctx.body = response
  geneToken(ctx)
})

// 产生验证码
koaRouter.get('/userGeneCode', async (ctx) => {
  let code = Math.ceil(Math.random()*10000)
  let email = ctx.query['email']
  ctx.session = {
    email: email,
    code: code
  }
  sendCodeFromMail(email, code)
})

// 注册
koaRouter.post('/userRegister', async (ctx) => {
  let code = ctx.request.body['code']
  if (ctx.session && ctx.session.code === code) {
    loginController.userRegister(ctx)
  } else {

  } 
})

// 更改登陆密码
koaRouter.get('/changeLoginPass', async (ctx) => {
  await checkToken(ctx)
  loginController.changeLoginPass(ctx)
})

app.use(koaRouter.routes())

app.listen(port)
