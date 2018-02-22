const session = require('koa-session-minimal')
const MysqlSession = require('koa-mysql-session')
const LoginController = require('./controllers/LoginController.js')
const AssetsController = require('./controllers/AssetsController.js')
const AssetsRollInController = require('./controllers/AssetsRollInController.js')
const AssetsRollOutController = require('./controllers/AssetsRollOutController.js')
const { sendCodeFromMail } = require('./libs/mailer.js')
const { LoginCodes, errorRes, succRes } = require('./libs/msgCodes/StatusCodes.js')
const Koa = require('koa')
const koaRouter = require('koa-router')()
const cors = require('koa-cors')
const koaBody = require('koa-body')
const jwt = require('jsonwebtoken')

const app = new Koa()
const port = 7007
const loginController = new LoginController()
const assetsController = new AssetsController()
const assetsRollInController = new AssetsRollInController()
const assetsRollOutController = new AssetsRollOutController()
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
  // domain: '*', // 写cookie所在的域名
  httpOnly: true, // 是否只用于http请求中获取
  // overwrite: false,  // 是否允许重写
  // secure: 'true',
  // sameSite: '',
  // signed: ''
}
const cookieCryp = uuid()

app.use(koaBody())
app.use(cors({
  origin: 'http://localhost:9101',
  credentials: true
}))

// 使用session中间件
app.use(session({
  key: 'SESSION_ID',
  store: store,
  cookie: cookie
}))

function geneToken (ctx) {
  let email = ctx.query['email']
  let token = jwt.sign({ uid: email }, cookieCryp)
  ctx.cookies.set(
    'token',
    token,
    {
      // domain: '*', // 写cookie所在的域名
      // path: '', // 写cookie所在的路径
      // maxAge: 60 * 1000, // cookie有效时长
      // expires: new Date() + 60*1000,  // cookie失效时间
      httpOnly: true, // 是否只用于http请求中获取
      // overwrite: false // 是否允许重写
    }
  )
  ctx.cookies.set('uuid', email, { httpOnly: false })
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
    jwt.verify(token, cookieCryp, function (err, decoded) {
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
  let res = null
  ctx.session = {
    email: email,
    code: code
  }
  await sendCodeFromMail(email, code).then(v => {
    res = succRes(LoginCodes.Mail_Send_Succ, {})
  }).catch(e => {
    res = errorRes(LoginCodes.Mail_Send_Error)
  })
  ctx.body = res
})

// 注册
koaRouter.post('/userRegister', async (ctx) => {
  let code = null
  if (ctx.request.body && ctx.request.body.code) {
    code = ctx.request.body.code
  }
  let res = null
  if (ctx.session && ctx.session.code === parseInt(code)) {
    let data = loginController.userRegister(ctx)
    await data.then(v => {
      res = v
    })
  } else {
    res = errorRes(LoginCodes.Code_Error)
  }
  ctx.body = res
})

// 验证码验证
koaRouter.get('/userCheckCode', (ctx) => {
  let code = ctx.query['code']
  if (ctx.session && ctx.session.code === parseInt(code)) {
    ctx.body = succRes(LoginCodes.Code_Correct, {})
    geneToken(ctx)
  } else {
    ctx.body = errorRes(LoginCodes.Code_Error)
  }
})

// 更改登陆密码
koaRouter.post('/userChangeLoginPass', async (ctx) => {
  let email = ''
  let res = null
  await checkToken(ctx)
  .catch(e => {
    res = errorRes(LoginCodes.Code_Error)
  })
  if (res !== null) {
    ctx.body = res
    return
  }
  if (ctx.request.body && ctx.request.body.email) {
    email = ctx.request.body.email
  }
  if (email !== ctx.cookies.get('uuid')) {
    res = errorRes(LoginCodes.Code_Error)
  } else {
    let data = loginController.changeLoginPass(ctx)
    await data.then(v => {
      res = v
    })
  }
  ctx.body = res
})

// assets查询所有资产
koaRouter.get('/queryAllAssets', async (ctx) => {
  let res = null
  await assetsController.queryAllAssets()
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// RollInAssets查询所有订单
koaRouter.get('/queryAllRollInAssets', async (ctx) => {
  let res = null
  await assetsRollInController.queryAllRollInAssets()
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 查询某一特定用户的转入资产
koaRouter.get('/queryRollInAssetsByAddr', async (ctx) => {
  let res = null
  await assetsRollInController.queryRollInAssetsByAddr(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 转入订单确认
koaRouter.post('/checkOverRollInOrder', async (ctx) => {
  let res = null
  let type = parseInt(ctx.request.body.assetsData.type)
  let flag = false
  if (type === 1) {
    await assetsController.setEthAssets(ctx)
    .then(v => {
      flag = true
    })
    .catch(e => {
      res = e
    })
  } else if (type === 2) {
    await assetsController.setEosAssets(ctx)
    .then(v => {
      flag = true
    })
    .catch(e => {
      res = e
    })
  } else {}
  if (!flag) {
    ctx.body = res
    return
  }
  await assetsRollInController.checkOverRollInOrder(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 转入订单取消
koaRouter.post('/deleteRollInOrder', async (ctx) => {
  let res = null
  await assetsRollInController.deleteRollInOrder(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// RollOutAssets查询所有订单
koaRouter.get('/queryAllRollOutAssets', async (ctx) => {
  let res = null
  await assetsRollOutController.queryAllRollOutAssets()
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 查询某一特定用户的提现订单
koaRouter.get('/queryRollOutAssetsByAddr', async (ctx) => {
  let res = null
  await assetsRollOutController.queryRollOutAssetsByAddr(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 提现订单确认
koaRouter.post('/checkOverRollOutOrder', async (ctx) => {
  let res = null
  let type = parseInt(ctx.request.body.assetsData.type)
  let flag = false
  if (type === 1) {
    await assetsController.setEthAssets(ctx)
    .then(v => {
      flag = true
    })
    .catch(e => {
      res = e
    })
  } else if (type === 2) {
    await assetsController.setEosAssets(ctx)
    .then(v => {
      flag = true
    })
    .catch(e => {
      res = e
    })
  } else {}
  if (!flag) {
    ctx.body = res
    return
  }
  await assetsRollOutController.checkOverRollOutOrder(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// 提现订单取消
koaRouter.post('/deleteRollOutOrder', async (ctx) => {
  let res = null
  await assetsRollOutController.deleteRollOutOrder(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

app.use(koaRouter.routes())

app.listen(port)
