const LandProductModel = require('../models/LandProductModel.js')
const _ = require('lodash')
const async = require('async')
const landProductModel = new LandProductModel()
const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()
const { checkToken, checkUserToken, userAuthCheck, decrypt, getParamsCheck, commitTrans } = require('../libs/CommonFun.js')
const { LandAssetsClientModel, LandAssetsServerModel } = require('../sqlModel/landAssets.js')
const { UserServerModel } = require('../sqlModel/user.js')
const { LandProductClientModel, LandProductServerModel } = require('../sqlModel/landProduct.js')
const { LandProductCodes, LoginCodes, CommonCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')
const { VoteListServerModel } = require('../sqlModel/voteList.js')
/**
	业务函数:
		- findProductByGeo  // 根据经纬度查询ethland物品
    - getStarPoint // 得到当前的star point列表
    - 查询某个地址下所有商品 queryLandProductByAddr
    - 增加待投票的商品 addVoteProduct
    - 获取当前投票中的商品 getCurrentVotedProduct
    - 对商品进行投票 voteProduct
    - 对商品属性进行投票 voteProductAttr
    - 商品投票结束 productVotedOver
    - 获得当前正在出售的商品 getCurrentProduct
    - 下架过期商品 dropOffProduct
    - 删除过期商品 deleteExpiredProduct
    - 兑换商品 exchangeProduct
    - 更新用户的竹子数量 updateUserBamboo
    - 查询某个用户的所有商品提现信息 queryUserAllProduct
    - 查询商品的属性票数 queryCountOfProductId
    - 获取剩余的正在活动的商品 getCurrentLeftProduct
    - 删除商品 deleteProduct
    - 查看当前活动中剩余的商品列表 getLeftProductInCurActivity
	辅助函数:
		- cacl 计算最终的经纬度与长宽
    - geneStarPoint 商品产生核心点
    - getNextVoteStartTime 获取下期投票时间
    - changeNextVoteStartTime 更改下期投票时间
    - getCurActivityPeriod 获取当前活动是第几周期 
*/
class LandProductController {
	constructor () {
    this.starPoint = [] // 商品中心点数组
    this.starCount = 5 // 中心点数量
    this.nextVoteStartTime = 1533016502 // 下期商品投票开始时间
    setInterval(() => {
      this.geneStarPoint()
    }, 5000)
	}

  /**
   * 增加商品 addVoteProduct
   */
   async addVoteProduct (ctx) {
    if (!userAuthCheck(ctx)) return new Error('没有权限')
    const proInfo = ctx.request.body
    const proId = proInfo.productId
    const isExistPro = await landProductModel.queryProductById(proId)
    if (!isExistPro) return new Error('增加商品失败')
    if (isExistPro.length === 0) {
      const addVote = await landProductModel.addVoteProduct(proInfo)
      return addVote
    } else {
      const editPro = await landProductModel.editNextProduct(proInfo)
      return editPro
    }
    // const pwd = ctx.query['pwd']
    // if (pwd !== 'chenye1234') return new Error(CommonCodes.No_Access)
    
  }

  /**
   * 删除商品 deleteProduct
   */
  async deleteProduct (ctx) {
    if (!userAuthCheck(ctx)) return new Error('没有权限')
    const proId = ctx.query['productId']
    const products = await landProductModel.deleteProduct(proId)
    return products
  }

  /**
   * 查看当前活动中剩余的商品列表 getLeftProductInCurActivity
   */
  async getLeftProductInCurActivity (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const leftPro = await landProductModel.getLeftProductInCurActivity()
    return leftPro
  }

  /**
    * 查询某个地址下所有商品 queryLandProductByAddr
    */
  async queryLandProductByAddr (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const addr = ctx.query['addr']
    if (!addr) return new Error(CommonCodes.Params_Check_Fail)
    const products = await landProductModel.queryLandProductByAddr(addr)
    return products
  }

  /**
    * 获取当前投票中的商品 getCurrentVotedProduct
    */
  async getCurrentVotedProduct (ctx) {
    // const tokenCheck = await checkUserToken(ctx)
    // if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const voteProduct = await landProductModel.getPrepareProduct()
    return voteProduct
  }

  /**
   * 给商品投票 voteProduct
   */

  async voteProduct (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const curTime =  Date.parse(new Date()) / 1000
    // 不在投票时间内
    if (!((curTime > this.nextVoteStartTime) && (curTime < this.nextVoteStartTime + 36 * 3600))) {
      return new Error('time_expired')
    }
    const userAddr = ctx.cookies.get('userAddr')
    const voteNum = parseInt(ctx.query['num'])
    const productId = ctx.query['productId']
    // const period = parseInt(ctx.query['period'])
    const paramsType = [
      {
        label: 'num',
        vali: 'valiBamboo'
      },
      {
        label: 'productId',
        vali: 'valiProductId'
      }
    ]
    const params= await getParamsCheck(ctx, paramsType)
    if (_.isError(params)) return params
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)'])
    const bambooCount = await landProductModel.queryUserBambooCount(userAddr)
    if (!bambooCount) return bambooCount
    if (bambooCount.length === 0) return new Error(LoginCodes.Login_No_Account)
    const leftBamboo = parseInt(bambooCount[0][LandAssetsServerModel.bamboo.label]) - voteNum
    if (leftBamboo < 0) {
      return new Error(LandProductCodes.Insufficient_Bamboo_Balance)
    }
    const trans = await landProductModel.startTransaction()
    if (!trans) return new Error(CommonCodes.Service_Wrong)
    let tasks = [
      async function () {
        const votePro = await landProductModel.voteProduct(productId, voteNum)
        return votePro
      },
      async function (res) {
        if (_.isError(res)) return res
        const minusBamboo = await landProductModel.minusUserBamboo(userAddr, voteNum)
        return minusBamboo
      },
      async function (res) {
        if (_.isError(res)) return res
        const insertVoteList = await landProductModel.insertVoteProductList(userAddr, productId, null, period, voteNum)
        return insertVoteList
      },
      function (res, callback) {
        if (_.isError(res)) {
          callback(res)
        } else {
          callback(null, res)
        }
      }
    ]
    return commitTrans(trans, tasks) 
  }

  /**
   * 查询商品的属性票数 queryCountOfProductId
   */
  async queryCountOfProductId (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const curTime =  Date.parse(new Date()) / 1000
    // 不在投票时间内
    if (!((curTime < this.nextVoteStartTime + 48 * 3600) && (curTime > this.nextVoteStartTime + 36 * 3600))) {
      return new Error('time_expired')
    }
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)'])
    const queryVote = await landProductModel.queryCountOfProductId(period)
    return queryVote
  }

  /**
   * 获取剩余的正在活动的商品 getCurrentLeftProduct
   */
  async getCurrentLeftProduct (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)']) - 1
    const tagsArr = ['product']
    let leftProductObj = {}
    for (const tag of tagsArr) {
      const products = await landProductModel.filterProductByTag(tag, period)
      if (products.length === 0) return {}
      if (products && products.length > 0) {
        for (const pro of products) {
          let proId = pro[LandProductServerModel.productId.label]
          // 已经集齐了多少个商品
          const count = await landProductModel.queryCollectedProCount(proId)
          // 商品投票的票数
          const vote = await landProductModel.getProductVoteNum(proId)
          let totalNum = 1
          if (vote && vote.length > 0) {
            const voteNum = parseInt(vote[0][LandProductServerModel.time.label])
            const value = parseInt(vote[0][LandProductServerModel.value.label])
            // 总数量
            totalNum = parseInt(voteNum / (100 * value)) === 0 ? 1:parseInt(voteNum / (100 * value))
          }
          // 剩余数量
          const leftLen = totalNum - count.length > 0 ? totalNum - count.length : 0
          leftProductObj[proId] = leftLen
          // if (index === products.length - 1) {
          //   return leftProductObj
          // }
        }
        return leftProductObj
      }
    }
  }

  /**
   *  给商品属性投票 voteProductAttr
   */
  async voteProductAttr (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const userAddr = ctx.cookies.get('userAddr')
    const voteNum = parseInt(ctx.query['num'])
    const productId = ctx.query['productId']
    const attr = ctx.query['attr']
    // const period = parseInt(ctx.query['period'])
    const paramsType = [
      {
        label: 'num',
        vali: 'valiBamboo'
      },
      {
        label: 'productId',
        vali: 'valiProductId'
      },
      {
        label: 'attr',
        vali: 'valiProductAttr'
      }
    ]
    const params= await getParamsCheck(ctx, paramsType)
    if (_.isError(params)) return params
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)'])
    const bambooCount = await landProductModel.queryUserBambooCount(userAddr)
    if (!bambooCount) return bambooCount
    if (bambooCount.length === 0) return new Error(LoginCodes.Login_No_Account)
    const leftBamboo = parseInt(bambooCount[0][LandAssetsServerModel.bamboo.label]) - voteNum
    if (leftBamboo < 0) {
      return new Error(LandProductCodes.Insufficient_Bamboo_Balance)
    }
    const trans = await landProductModel.startTransaction()
    if (!trans) return new Error(CommonCodes.Service_Wrong)
    let tasks = [
      async function () {
        const votePro = await landProductModel.voteProduct(productId, voteNum)
        return votePro
      },
      async function (res) {
        if (_.isError(res)) return res
        const minusBamboo = await landProductModel.minusUserBamboo(userAddr, voteNum)
        return minusBamboo
      },
      async function (res) {
        if (_.isError(res)) return res
        const insertVoteList = await landProductModel.insertVoteProductList(userAddr, productId, attr, period, voteNum)
        return insertVoteList
      },
      function (res, callback) {
        if (_.isError(res)) {
          callback(res)
        } else {
          callback(null, res)
        }
      }
    ]
    return commitTrans(trans, tasks) 
  }

  /**
   * 商品投票结束 productVotedOver
   */
  async productVotedOver (ctx) {
    if (!userAuthCheck(ctx)) return new Error('没有权限')
    const productSoldNum = 5
    const prepareProductArr = await landProductModel.getPrepareProduct()
    if (!prepareProductArr) return new Error(LandProductCodes.Get_Prepare_Product_Fail)
    const cutLen = prepareProductArr.length > productSoldNum ? productSoldNum: prepareProductArr.length
    prepareProductArr.sort((a, b) => {
      return parseInt(b[LandProductServerModel.time.label]) - parseInt(a[LandProductServerModel.time.label])
    })
    const filterArr = prepareProductArr.slice(0, cutLen)
    for (let pro of filterArr) {
      const curTime = new Date().getTime() + 3 * 60 * 24 * 60
      const sellPro = await landProductModel.sellProduct(pro[LandProductServerModel.productId.label], curTime)
      if (!sellPro) return new Error(LandProductCodes.Sell_Product_Fail)
      // TODO 确认商品属性
      const attr = await landProductModel.queryCountOfProductById(pro[LandProductServerModel.productId.label])
      if (!attr || attr.length === 0) continue
      attr.sort((a, b) => {
        return parseInt(b['sum(amount)']) - parseInt(a['sum(amount)'])
      })
      if (attr[0][VoteListServerModel.attr.label]) {
        const setAttr = await landProductModel.setProductAttr(attr[0][VoteListServerModel.attr.label], pro[LandProductServerModel.productId.label])
        if (!setAttr) return setAttr
      }
    }
    const endVote = await landProductModel.endProductVote()
    return endVote
  }


  /**
   * 获得当前正在出售的商品 getCurrentProduct
   */
  async getCurrentProduct (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)'] - 1)
    const curProduct = await landProductModel.getCurrentProductByPeriod(period)
    return curProduct
  }

  /**
   * 下架过期商品 dropOffProduct
   */
  async dropOffProduct () {
    const curProduct = await landProductModel.getCurrentProductByPeriod(1)
    if (!curProduct || curProduct.length === 0) return
    let curTime = new Date().getTime()
    for (let pro of curProduct) {
      if (curTime > pro[LandProductServerModel.time.label]) {
        const dropPro = await landProductModel.productDropOff(pro[LandProductServerModel.productId.label])
        if (!dropPro) return new Error(LandProductCodes.Drop_Product_Fail)
      }
    }
  }

  /**
    * 删除过期商品 deleteExpiredProduct
    */
  async deleteExpiredProduct () {
    const expiredTime = 3 * 26 * 60 * 60
    const expiredProduct = await landProductModel.getExpiredProduct()
    if (!expiredProduct || expiredProduct.length === 0) return
    let delTime = new Date().getTime() - expiredTime
    for (let pro of expiredProduct) {
      if (delTime > pro[LandProductServerModel.time.label]) {
        const dropPro = await landProductModel.deleteProduct(pro[LandProductServerModel.productId.label])
        if (!dropPro) return new Error(LandProductCodes.Del_Product_Fail)
      }
    }
  }

  /**
    * 兑换商品 exchangeProduct
    */
  async exchangeProduct (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const paramsType = [
      {
        label: 'pwd',
        vali: 'valiPass'
      },
      {
        label: 'addr',
        vali: 'valiAddr'
      },
      {
        label: 'productId',
        vali: 'valiProductId'
      },
      {
        label: 'userPhone',
        vali: 'valiPhone'
      }
    ]
    const params= await getParamsCheck(ctx, paramsType)
    if (_.isError(params)) return params
    const code = ctx.query['code']
    const pwd = ctx.query['pwd']
    const userAddr = ctx.query['addr']
    const productId = ctx.query['productId']
    const userRealAddr = ctx.query['userRealAddr']
    const userPhone = ctx.query['userPhone']
    const userName = ctx.query['userName']
    // 交易密码 与验证码验证
    const realPwd = await landProductModel.queryUserTradePwd(userAddr)
    if (!realPwd) return realPwd
    if (realPwd[0][UserServerModel.tradePwd.label] !== pwd) return new Error(LoginCodes.Trade_Pwd_Wrong)
    const email = await landProductModel.queryUserEmail(userAddr)
    if(!email) return email
    let tmpCode = null
    if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
      tmpCode = ctx.cookies.get('tmpUserId')
    }
    let decryptRes = parseInt(decrypt(tmpCode, email[0][UserServerModel.email.label]))
    if (decryptRes - 1 !== parseInt(code)) {
      return new Error(LoginCodes.Code_Error)  
    }
    const specifiedPro = await landProductModel.querySpecifiedProByAddr(userAddr, productId)
    if (!specifiedPro || specifiedPro.length === 0 || parseInt(specifiedPro[0][LandProductServerModel.value.label]) < 1) {
      return new Error(LandProductCodes.User_No_Such_Product)
    }
    const trans = await landProductModel.startTransaction()
    if (!trans) return new Error(CommonCodes.Service_Wrong)
    let tasks = [
      async function () {
        const deletePro = await landProductModel.deleteLandProductFrag(trans, userAddr, productId)
        return deletePro
      },
      async function (res) {
        if (_.isError(res)) return res
        const insertPro = await landProductModel.insertUserProduct(trans, userAddr, productId, userRealAddr, userPhone)
        return insertPro
      },
      function (res, callback) {
        if (_.isError(res)) {
          callback(res)
        } else {
          callback(null, res)
        }
      }
    ]
    return commitTrans(trans, tasks)
  }

  /**
   *  查询某个用户的所有商品提现信息 queryUserAllProduct
   */
  async queryUserAllProduct (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const userAddr = ctx.query['addr']
    const allProduct = await landProductModel.queryUserAllProduct(userAddr)
    return allProduct
  }

	findProductByGeo (longitude, latitude, rate, direction, hungry, speed) {
		// TODO 参数校验
		let geoParams = this.cacl(longitude, latitude, rate, direction, hungry, speed)
		let ctxRes = null
		return landProductModel.findProductByGeo(geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
		.then(v => {
			console.log(v)
			return succRes('findProductByGeo', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

  async updateUserBamboo (ctx) {
    const tokenCheck = await checkUserToken(ctx)
    if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
    const addr = ctx.query['addr']
    const addrVali = await joiParamVali.valiAddr(addr)
    if (_.isError(addrVali)) return addrVali
    const updateBamboo = await landProductModel.updateUserBamboo(addr)
    return updateBamboo
  }

  geneStarPoint () {
    this.starPoint = []
    for (let i = 0; i < this.starCount; i++) {
      let longitude = parseInt(Math.random().toFixed(3) * 360) - 180
      let latitude = parseInt(Math.random().toFixed(3) * 180) - 90
      this.starPoint.push([ longitude, latitude])
    }
  }

  getStarPoint () {
    return this.starPoint
  }

	cacl (long, lati, rate, direction, hungry, speed) {
    let tmpWidth = 0
    let tmpHeight = 0
    if (direction === 'east') {
      tmpWidth = rate * (hungry / 100)
      tmpHeight = rate * (speed / 100)
      lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
    } else if (direction === 'west') {
      tmpWidth = rate * (hungry / 100)
      tmpHeight = rate * (speed / 100)
      lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else if (direction === 'north') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    } else if (direction === 'south') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
    } else if (direction === 'northEast') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    } else if (direction === 'northWest') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else if (direction === 'southEast') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
    } else if (direction === 'southWest') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else {}
    return {
      longitude: long,
      latitude: lati,
      width: tmpWidth,
      height: tmpHeight
    }
  }

  // getNextVoteStartTime 获取下期投票时间
  getNextVoteStartTime () {
    return this.nextVoteStartTime
  }

  // changeNextVoteStartTime 更改下期投票时间
  changeNextVoteStartTime (val) {
    this.nextVoteStartTime = val
  }

  async getCurActivityPeriod () {
    const curPeriod = await landProductModel.getCurrentPeriodProduct()
    if (!curPeriod) return curPeriod
    const period = parseInt(curPeriod[0]['max(idx_period)'])
    return period
  }

	// 封装GET请求的参数
  getParamsCheck (ctx, paramsArray) {
    if (ctx.request.method !== 'GET') {
      // ctx.body = '接口请求方式必须为GET'
      return null
    }
    let params = {}
    paramsArray.forEach((element) => {
      params[element] = ctx.query[element]
    })
    return params
  }
}

module.exports = LandProductController