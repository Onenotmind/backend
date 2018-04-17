const _ = require('lodash')
const crypto = require('crypto')
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
const UserDetailController = require('./controllers/UserDetailController.js')
const { sendCodeFromMail } = require('./libs/mailer.js')
const { LoginCodes, CommonCodes, errorRes, LandProductCodes, succRes, PandaOwnerCodes, PandaLandCodes } = require('./libs/msgCodes/StatusCodes.js')
const { getParamsCheck, postParamsCheck, uuid, decrypt, encrypt, geneToken, checkToken } = require('./libs/CommonFun.js')
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
const userDetailController = new UserDetailController()
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
  @通用函数
    - 产生验证码 geneEmailCode
    - 加密算法 encrypt
    - 解密算法 decrypt
*/


koaRouter.post('/userRegister', async (ctx) => {
  const res = await userDetailController.userRegister(ctx)
  if (_.isError(res)) {
    ctx.body = errorRes(res.message)
  } else {
    ctx.body = succRes(LoginCodes.Register_Succ, res)
  }
})

koaRouter.get('/userLogin', async (ctx) => {
  const res = await userDetailController.userLogin(ctx)
  if (!_.isError(res)) {
    const token = geneToken(ctx.query['addr'])
    ctx.cookies.set(
    'userAddr',
    '123',
    {
      // expires: new Date() + 60*1000,  // cookie失效时间
      httpOnly: true
    }
  )
    ctx.body = succRes(LoginCodes.Login_Succ, token)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.post('/userChangeLoginPass', async (ctx) => {
  const res = await userDetailController.changeLoginPwd(ctx)
  if (res) {
    ctx.body = succRes(LoginCodes.Change_Login_Pwd_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})


koaRouter.post('/userChangeTradePass', async (ctx) => {
  const res = await userDetailController.changeTradePwd(ctx)
  if (res) {
    ctx.body = succRes(LoginCodes.Change_Trade_Pwd_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

/**
   * 产生验证码 userGeneCode
   * @property {string} email 
   */
koaRouter.get('/userGeneCode', async (ctx) => {
  const geneCode = await geneEmailCode(ctx)
  if (!geneCode) {
    ctx.body = errorRes(LoginCodes.Mail_Send_Error)
  } else {
    ctx.body = succRes(LoginCodes.Mail_Send_Succ, {})
  }
})

koaRouter.get('/userCheckCode', async (ctx) => {
  const res = await userDetailController.checkEmailCode(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Code_Correct, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

/**
   * 产生验证码 geneEmailCode 工具函数
   * @property {string} email 
   */
async function geneEmailCode (ctx) {
  let code = Math.ceil(Math.random()*10000)
  let email = ctx.query['email']
  let encryptCode = encrypt((code + 1).toString(), email)
  ctx.cookies.set(
    'tmpUserId',
    encryptCode,
    {
      // expires: new Date() + 60*1000,  // cookie失效时间
      httpOnly: true
    }
  )
  const sendCode = await sendCodeFromMail(email, code)
  console.log('sendCode', sendCode)
  if (!sendCode) return false
  return true
}


koaRouter.get('/getUserInfoAndAssetsByAddr', async (ctx) => {
  const res = await userDetailController.getUserInfoAndAssetsByAddr(ctx)
  if (res) {
    ctx.body = succRes(LoginCodes.Assets_Data_Normal, res)
  } else {
    ctx.body = errorRes(res.message)
  }
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
    - 孵化熊猫 sirePanda
*/
koaRouter.get('/queryAllPandaByAddr', async (ctx) => {
  const res = await pandaOwnerController.queryAllPandaByAddr(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaOwnerCodes.Query_Panda_By_Addr, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/sellPanda', async (ctx) => {
  const res = await pandaOwnerController.sellPanda(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Sell_Panda_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/delPandaByGen', async (ctx) => {
  const res = await pandaOwnerController.delPandaByGen(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Drop_Panda_Fail, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/queryPandaInfo', async (ctx) => {
  const res = await pandaOwnerController.queryPandaInfo(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaOwnerCodes.Query_Panda_Info_Normal, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

// testApi getEthlandProduct?pandaGeni=0x12987uhvr453buyvu3u89&bamboo=300
koaRouter.get('/getEthlandProduct', async (ctx) => {
  logger.error('/getEthlandProduct')
  const res = await transactionController.getEthlandProduct(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Panda_Out_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/getPandaBackAssets', async (ctx) => {
  const res = await pandaOwnerController.getPandaBackAssets(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Back_Assets_Carry_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
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

koaRouter.get('/sirePanda', async (ctx) => {
  const res = await pandaOwnerController.sirePanda(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Panda_Sire_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

/**
  @market
    - 查询所有售卖中的熊猫 queryAllPandaSold
    - 购买熊猫 buyPanda
*/

koaRouter.get('/queryAllPandaSold', async (ctx) => {
  const res = await pandaOwnerController.queryAllPandaBeSold(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaOwnerCodes.Query_Panda_In_Sold, res)
  } else {
    ctx.body = errorRes(res.message)
  }
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

/**
  @landProduct
    - 查看当前的商品中心 getCurrentStarPoint
*/

koaRouter.get('/getCurrentStarPoint', (ctx) => {
  let starArr = landProductController.getStarPoint()
  if (starArr && starArr.length > 0) {
    ctx.body = succRes(LandProductCodes.Get_Star_Point_Succ, starArr)
  } else {
    ctx.body = errorRes(LandProductCodes.Get_Star_Point_Fail)
  }
})

app.use(koaRouter.routes())

app.listen(port)
