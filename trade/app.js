const LoginController = require('./controllers/LoginController.js')
const koa = require('koa')
const koaRouter = require('koa-router')()
const koaBody = require('koa-body')

const app = new koa()
const port = 7007
const loginController = new LoginController()

app.use(koaBody())

// 登陆
koaRouter.get('/login', loginController.userLogin)

// 注册
koaRouter.post('/register', loginController.userRegister)

app.use(koaRouter.routes())

app.listen(port)