const _ = require('lodash')
// const session = require('koa-session-minimal')
// const MysqlSession = require('koa-mysql-session')
const Db = require('./models/Db.js')
const db = new Db()
const LoginController = require('./controllers/LoginController.js')
const AssetsController = require('./controllers/AssetsController.js')
const AssetsRollInController = require('./controllers/AssetsRollInController.js')
const AssetsRollOutController = require('./controllers/AssetsRollOutController.js')
const LandProductController = require('./controllers/LandProductController.js')
const PandaOwnerController = require('./controllers/PandaOwnerController.js')
const LandAssetsController = require('./controllers/LandAssetsController.js')
const TransactionController = require('./controllers/TransactionController.js')
const { sendCodeFromMail } = require('./libs/mailer.js')
const { LoginCodes, errorRes, succRes } = require('./libs/msgCodes/StatusCodes.js')
const Koa = require('koa')
const koaRouter = require('koa-router')()
const cors = require('koa-cors')
const koaBody = require('koa-body')
const jwt = require('jsonwebtoken')
const async = require('async')
const winston = require('winston')

const app = new Koa()
const port = 7007
const loginController = new LoginController()
const assetsController = new AssetsController()
const assetsRollInController = new AssetsRollInController()
const assetsRollOutController = new AssetsRollOutController()
const landProductController = new LandProductController()
const pandaOwnerController = new PandaOwnerController()
const landAssetsController = new LandAssetsController()
const transactionController = new TransactionController()
const testControllers = {
  'pandaOwnerController': pandaOwnerController,
  'transactionController': transactionController,
  'landAssetsController': landAssetsController
}

const { PandaOwnerClientModel } = require('./sqlModel/pandaOwner.js')
const { LandAssetsClientModel } = require('./sqlModel/landAssets.js')
let currentEthPrice = 3000
let currentBambooPrice = 1
let currentWaterPrice = 3
let bambooTitudeRate = 1000 // 竹子/经纬度 比例

/**
  @日志系统

*/
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'filelog-error.log',
      level: 'error'
    })
  ]
})

/**
  @token与session/cookie
    - token/session方案 暂时不用
    - geneToken 生成token
    - checkToken 验证token
*/

// 配置存储session信息的mysql
// let store = new MysqlSession({
//   user: 'root',
//   password: 'chenye8685800',
//   database: 'trade',
//   host: 'localhost',
// })

// // 使用session中间件
// app.use(session({
//   key: 'SESSION_ID',
//   store: store,
//   cookie: cookie
// }))

// // 存放sessionId的cookie配置
// let cookie = {
//   // maxAge: '', // cookie有效时长
//   // expires: '',  // cookie失效时间
//   // path: '', // 写cookie所在的路径
//   // domain: '*', // 写cookie所在的域名
//   httpOnly: true, // 是否只用于http请求中获取
//   // overwrite: false,  // 是否允许重写
//   // secure: 'true',
//   // sameSite: '',
//   // signed: ''
// }
const cookieCryp = uuid()

app.use(koaBody())
app.use(cors({
  origin: 'http://localhost:9101',
  credentials: true
}))

function geneToken (addr) {
  // let token = jwt.sign({ uid: addr }, cookieCryp)
  // ctx.cookies.set(
  //   'token',
  //   token,
  //   {
  //     // domain: '*', // 写cookie所在的域名
  //     // path: '', // 写cookie所在的路径
  //     // maxAge: 60 * 1000, // cookie有效时长
  //     // expires: new Date() + 60*1000,  // cookie失效时间
  //     httpOnly: true, // 是否只用于http请求中获取
  //     // overwrite: false // 是否允许重写
  //   }
  // )
  // ctx.cookies.set('uuid', email, { httpOnly: false })
  return jwt.sign({ uid: addr }, cookieCryp)
}

function checkToken (token, addr) {
  return new Promise((resolve, reject) => {
    // let uuid = ctx.cookies.get('uuid')
    // let token = ctx.cookies.get('token')
    if (!token) reject(new Error('token is  null.'))
    jwt.verify(token, cookieCryp, function (err, decoded) {
      if (err) reject(new Error(err))
      if (decoded.uid !== addr) reject('token is out')
      resolve(decoded)
    })
  })
}


/**
  @公用方法：
    - 生成唯一标识id uuid
    - 封装GET请求的参数 getParamsCheck
*/

function uuid (a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}


function getParamsCheck (ctx, paramsArray) {
  return new Promise((resolve, reject) => {
    let params = []
    paramsArray.forEach((element) => {
      if (ctx.query[element]) {
        params.push(ctx.query[element])
      } else {
        reject(new Error(`参数${element}不为空！`))
      }
    })
    resolve(params)
  })
}
/**
  @登陆
    - userLogin 用户登陆
    - userRegister 用户注册 只需要地址与密码即可
    - userGeneCode 发送验证码给邮箱
    - userCheckCode 验证验证码正确与否
    - userChangeLoginPass 更改登陆密码
    - userChangeTradePass 更改交易密码
    - userRegisterByRandom 用户随机注册
    - testTrans 测试user事务
  @个人资产管理
    - 获取用户详细信息和资产 getUserInfoAndAssetsByAddr
*/

koaRouter.get('/testTrans', async (ctx) => {
  const connection = await db.startTransaction()
  if (!connection) return
  connection.beginTransaction(function (err) {
    if(err) return
    async.series([
      function (callback) {
        var sql1 = "update user set upass=? where uaddr= ?"
        var param1 = ['12345', '123']
        connection.query(sql1, param1, function (qErr, rows, fields) {
          if (qErr) {
            connection.rollback(function () {
              connection.release()
            })
          } else {
            console.log('succRes')
            callback(null)
          }
        })
      },
      function (callback) {
        var sql1 = "update user set utradePass=? where uaddr= ?"
        var param1 = ['12345', '123']
        connection.query(sql1, param1, function (qErr, rows, fields) {
          // if (qErr) {
            connection.rollback(function () {
              connection.release()
            })
          // } else {
          //   callback(null)
          // }
        })
      }
    ], function (tErr, res) {
      if (tErr) {
        connection.rollback(function () {
          console.log("transaction error: " + tErr)
          connection.release()
        })
      } else {
        connection.commit(function (err, info) {
          if (err) {
            connection.rollback(function (err) {
              console.log("transaction error: " + err)
              connection.release()
            })
          } else {
            connection.release()
          }
        })
      }
    })
  })
})

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

koaRouter.get('/userRegisterByRandom', async (ctx) => {
  let res = null
  await loginController.userRegisterByRandom(ctx)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/getUserInfoAndAssetsByAddr', async (ctx) => {
  let addr = ctx.query['addr']
  let res = null
  const userInfo = await loginController.getUserInfoByAddr(addr)
  if (!userInfo) {
    ctx.body = errorRes('没有该用户')
  }
  const userAssets = await landAssetsController.queryAssetsByAddr(addr)
  if (!userAssets) {
    ctx.body = errorRes('服务器异常！')
  }
  const user = _.concat(userInfo, userAssets)
  ctx.body = succRes('getUserInfoAndAssetsByAddr', user)
})

/**
  @后台资产管理系统
    - queryAllAssets 查询用户所有资产
    - queryAllRollInAssets 查询转入所有订单
    - queryRollInAssetsByAddr 查询某一用户的转入订单
    - checkOverRollInOrder 转入订单确认
    - deleteRollInOrder 删除转入订单
    - queryAllRollOutAssets 查询所有提现订单
    - queryRollOutAssetsByAddr 查询某一用户的提现订单
    - checkOverRollOutOrder 提现订单确认
    - deleteRollOutOrder 提现订单取消
*/

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


/**
  land:
    - 查询某地址下所有熊猫 queryAllPandaByAddr
    - 熊猫外出获取宝物 getEthlandProduct
    - 查询某个熊猫的详细信息 queryPandaInfo
    - 随机产生一只g10熊猫 genePandaRandom
    - 查询某只熊猫外出回归带的物品 getPandaBackAssets
    - 出售熊猫 sellPanda
    - 丢弃熊猫 delPandaByGen
*/
koaRouter.get('/queryAllPandaByAddr', async (ctx) => {
  let addr = ctx.query['addr']
  if (addr === undefined || addr === null) return 
  let res = null
  await pandaOwnerController.queryAllPandaByAddr(addr)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/sellPanda', async (ctx) => {
  let gen = ctx.query['pandaGen']
  let price = ctx.query['price']
  if (gen === undefined || gen === null) return 
  let res = null
  await pandaOwnerController.sellPanda(gen, price)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/delPandaByGen', async (ctx) => {
  let gen = ctx.query['pandaGen']
  if (gen === undefined || gen === null) return 
  let res = null
  await pandaOwnerController.delPandaByGen(gen)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/queryPandaInfo', async (ctx) => {
  let gen = ctx.query['gen']
  if (gen === undefined || gen === null) return 
  let res = null
  await pandaOwnerController.queryPandaInfo(gen)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

// testApi getEthlandProduct?pandaGeni=0x12987uhvr453buyvu3u89&bamboo=300
koaRouter.get('/getEthlandProduct', async (ctx) => {
  logger.error('/getEthlandProduct')
  let geni = ctx.query['geni']
  let bamboo = ctx.query['bamboo']
  let direction = ctx.query['direction']
  let res = null
  await transactionController.getEthlandProduct(geni, bamboo, direction)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/getPandaBackAssets', async (ctx) => {
  let geni = ctx.query['pandaGen']
  let res = null
  await pandaOwnerController.getPandaBackAssets(geni)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.get('/genePandaRandom', async (ctx) => {
  let addr = ctx.query['addr']
  if (addr === undefined || addr === null) return
  let res = null
  await pandaOwnerController.genePandaRandom(addr)
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})


koaRouter.get('/serverTime', (ctx) => {
  let res = succRes('serverTime', Date.parse(new Date()) / 1000)
  ctx.body = res
})

/**
  @market
    - 查询所有售卖中的熊猫 queryAllPandaSold
    - 购买熊猫 buyPanda
*/

koaRouter.get('/queryAllPandaSold', async (ctx) => {
  let res = null
  await pandaOwnerController.queryAllPandaBeSold()
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})

koaRouter.post('/buyPanda', async (ctx) => {
  let requestData = ctx.request.body
  let res = null
  await transactionController.buyPanda(requestData['addr'], requestData['pandaGen'], requestData['price'])
  .then(v => {
    res = v
  })
  .catch(e => {
    res = e
  })
  ctx.body = res
})


koaRouter.get('/testApi', async (ctx) => {
  let res = null
  let testController = ctx.query['controller']
  let api = ctx.query['api']
  if (testControllers[testController].testApi) {
    await testControllers[testController].testApi(api)
    .then(v => {
      res = v
    })
    .catch(e => {
      res = e
    })
    ctx.body = res
  }
})

app.use(koaRouter.routes())

app.listen(port)
