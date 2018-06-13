const _ = require('lodash')
const crypto = require('crypto')
// const session = require('koa-session-minimal')
// const MysqlSession = require('koa-mysql-session')
const AssetsController = require('./controllers/AssetsController.js')
const AssetsRollInController = require('./controllers/AssetsRollInController.js')
const AssetsRollOutController = require('./controllers/AssetsRollOutController.js')
const LandProductController = require('./controllers/LandProductController.js')
const PandaOwnerController = require('./controllers/pandaOwnerController.js')
const LandAssetsController = require('./controllers/LandAssetsController.js')
const UserDetailController = require('./controllers/UserDetailController.js')
const TestController = require('./controllers/TestController.js')
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
require('winston-daily-rotate-file')
const app = new Koa()
const port = 3001
const assetsController = new AssetsController()
const assetsRollInController = new AssetsRollInController()
const assetsRollOutController = new AssetsRollOutController()
const landProductController = new LandProductController()
const pandaOwnerController = new PandaOwnerController()
const landAssetsController = new LandAssetsController()
const userDetailController = new UserDetailController()
const testController = new TestController()
const testControllers = {
  'pandaOwnerController': pandaOwnerController,
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
// const logger = new (winston.Logger)({
//   transports: [
//     new (winston.transports.File)({
//       name: 'info-file',
//       filename: 'filelog-info.log',
//       level: 'info'
//     }),
//     new (winston.transports.File)({
//       name: 'error-file',
//       filename: 'filelog-error.log',
//       level: 'error'
//     })
//   ]
// })
 
const transport = new (winston.transports.DailyRotateFile)({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

transport.on('rotate', function(oldFilename, newFilename) {
  // do something fun
})

const logger = new (winston.Logger)({
  transports: [
    transport
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
  origin: 'http://47.74.228.207',
  credentials: true
}))



/**
  @登陆
    - userLogin 用户登陆
    - userRegister 用户注册 只需要地址与密码即可
    - userGeneCode 发送验证码给邮箱
    - userCheckCode 验证验证码正确与否
    - userChangeLoginPass 更改登陆密码
    - changePwdWhenForget 忘记密码
    - userChangeTradePass 更改交易密码
    - userRegisterByRandom 用户随机注册
    - queryUserEmail 查询用户的邮箱 
    - testTrans 测试user事务
    - checkUserLoginExpired 检测用户是否还在登陆状态,判断token
  @个人资产管理
    - 获取用户详细信息和资产 getUserInfoAndAssetsByAddr
  @确认订单
    - 确认订单 exchangeProduct
  @通用函数
    - 产生验证码 geneEmailCode
    - 加密算法 encrypt
    - 解密算法 decrypt
*/


koaRouter.post('/userRegister', async (ctx) => {
  console.log('userRegister')
  const res = await userDetailController.userRegister(ctx)
  console.log('res', res)
  const token = geneToken(ctx.query['addr'])
  if (!_.isError(res)) {
    ctx.cookies.set(
    'userAddr',
    ctx.query['addr'],
    {
      // expires: new Date() + 60*1000,  // cookie失效时间
      httpOnly: true
    })
    ctx.body = succRes(LoginCodes.Register_Succ, token)
  } else {
    console.log('userRegister', res.message)
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/userLogin', async (ctx) => {
  const res = await userDetailController.userLogin(ctx)
  if (!_.isError(res)) {
    const userAddr = ctx.query['addr']
    const token = geneToken(userAddr)
    ctx.cookies.set(
    'userAddr',
    userAddr,
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
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Change_Login_Pwd_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/changePwdWhenForget', async (ctx) => {
  const res = await userDetailController.changePwdWhenForget(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Change_Login_Pwd_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})


koaRouter.post('/userChangeTradePass', async (ctx) => {
  const res = await userDetailController.changeTradePwd(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Change_Trade_Pwd_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

koaRouter.get('/queryUserEmail', async (ctx) => {
  const res = await userDetailController.queryUserEmail(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Query_Email_Succ, res)
  } else {
    ctx.body = errorRes(LoginCodes.User_Not_Bind_Email)
  }
})

koaRouter.get('/exchangeProduct', async (ctx) => {
  const res = await landProductController.exchangeProduct(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LandProductCodes.Exchange_Product_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  } 
})

koaRouter.get('/checkUserLoginExpired', async (ctx) => {
  const res = await userDetailController.checkUserLoginExpired(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes('token useful.', {})
  } else {
    ctx.body = errorRes('token expired')
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

koaRouter.get('/bindEmail', async (ctx) =>{
  const res = await userDetailController.bindEmail(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LoginCodes.Code_Correct, res)
  } else {
    ctx.body = errorRes(res.message)
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
  if (!_.isError(res)) {
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
  pandaowner:
    - 查询某地址下所有熊猫 queryAllPandaByAddr
    - 熊猫外出获取宝物 getEthlandProduct
    - 查询某个熊猫的详细信息 queryPandaInfo
    - 随机产生一只g10熊猫 genePandaRandom
    - 查询熊猫外出回归带的物品 getPandaBackAssets
    - 出售熊猫 sellPanda
    - 取消出售熊猫 unSoldPanda
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

koaRouter.get('/unSoldPanda', async (ctx) => {
  const res = await pandaOwnerController.unSoldPanda(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Unsell_Panda_Succ, res)
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
  // logger.error('/getEthlandProduct')
  const starArr = landProductController.getStarPoint()
  const res = await pandaOwnerController.getEthlandProduct(ctx, starArr)
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
  const res = await pandaOwnerController.genePandaRandom(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Gene_Free_Panda_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
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

koaRouter.get('/buyPanda', async (ctx) => {
  const res = await pandaOwnerController.buyPanda(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(PandaLandCodes.Buy_Panda_Succ, res)
  } else {
    ctx.body = errorRes(PandaLandCodes.Buy_Panda_Fail)
  }
})


/**
  @landProduct
    - 查看当前的商品中心 getCurrentStarPoint
    - 查询某个地址下所有商品 queryLandProductByAddr
    - 获取当前投票中的商品 getCurrentVotedProduct
    - 给商品投票 voteProduct
    - 获得当前正在出售的商品 getCurrentProduct
  @landassets
    - 更新用户的竹子数量 updateUserBamboo
*/

koaRouter.get('/getCurrentStarPoint', async (ctx) => {
  let starArr = await landProductController.getStarPoint()
  if (starArr && starArr.length > 0) {
    ctx.body = succRes(LandProductCodes.Get_Star_Point_Succ, starArr)
  } else {
    ctx.body = errorRes(LandProductCodes.Get_Star_Point_Fail)
  }
})

koaRouter.get('/queryLandProductByAddr', async (ctx) => {
  let products = await landProductController.queryLandProductByAddr(ctx)
  if (!_.isError(products)) {
    ctx.body = succRes(LandProductCodes.User_Product_Not_Null, products)
  } else {
    ctx.body = errorRes(LandProductCodes.User_Product_Null)
  }
})

koaRouter.get('/getCurrentVotedProduct', async (ctx) => {
  const votedProduct = await landProductController.getCurrentVotedProduct(ctx)
  if (votedProduct && votedProduct.length > 0) {
    ctx.body = succRes(LandProductCodes.Get_Prepare_Product_Succ, votedProduct)
  } else {
    ctx.body = errorRes(LandProductCodes.Get_Prepare_Product_Fail)
  }
})

koaRouter.get('/voteProduct', async (ctx) => {
  const res = await landProductController.voteProduct(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LandProductCodes.Vote_Product_Succ, res)
  } else {
    ctx.body = errorRes(LandProductCodes.Vote_Product_Fail)
  }
})

koaRouter.get('/getCurrentProduct', async (ctx) => {
  const res = await landProductController.getCurrentProduct(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LandProductCodes.Get_Current_Product_Succ, res)
  } else {
    ctx.body = errorRes(LandProductCodes.Get_Current_Product_Fail)
  }
})

koaRouter.get('/updateUserBamboo', async (ctx) =>{
  const res = await landProductController.updateUserBamboo(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes(LandProductCodes.Update_User_Bamboo_Succ, res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

/**
  * combo页面
  * 获取用户参与挖矿得到的bamboo数量 getUserBamboo TODO 暂时放在UserDetailController
  */
koaRouter.get('/getUserBamboo', async (ctx) => {
  const res = await userDetailController.getUserBamboo(ctx)
  if (!_.isError(res)) {
    ctx.cookies.set(
    'hash',
    res,
    {
      httpOnly: true
    })
    ctx.body = succRes(LoginCodes.Get_User_Bamboo, {})
  } else {
    ctx.body = errorRes(res.message)
  }
})

/**
  @测试：
    - api测试 testApi
    - 创建测试表 createTestTable
*/

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

koaRouter.get('/createTestTable', async (ctx) => {
  const res = await testController.createTestTable(ctx)
  if (!_.isError(res)) {
    ctx.body = succRes('测试数据插入成功!', res)
  } else {
    ctx.body = errorRes(res.message)
  }
})

app.use(koaRouter.routes())

app.on('error', err =>  
 logger.error('server error', err)  
)

app.listen(port)
