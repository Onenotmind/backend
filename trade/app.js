const LoginController = require('./controllers/LoginController.js')
const Koa = require('koa')
const koaRouter = require('koa-router')()
const koaBody = require('koa-body')
const jwt = require('jsonwebtoken')

const app = new Koa()
const port = 7007
const loginController = new LoginController()

app.use(koaBody())

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
    if (!token) reject(new Error(('token is  null.'))
    jwt.verify(token, 'id', function (err, decoded) {
      if (err) reject(new Error(err))
      if (decoded.uid !== uuid) reject('token is out')
      resolve(decoded)
    })
  })
}

// 登陆
koaRouter.post('/login', async (ctx) => {
  await loginController.userLogin(ctx)
  geneToken(ctx)
})

// 注册
koaRouter.post('/register', loginController.userRegister)

// 更改登陆密码
koaRouter.get('/changeLoginPass', async (ctx) => {
  await checkToken(ctx)
  loginController.changeLoginPass(ctx)
})

app.use(koaRouter.routes())

app.listen(port)
