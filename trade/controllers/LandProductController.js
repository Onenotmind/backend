const LandProductModel = require('../models/LandProductModel.js')
const _ = require('lodash')
const async = require('async')
const landProductModel = new LandProductModel()
const { checkToken, checkUserToken } = require('../libs/CommonFun.js')
const { LandProductClientModel } = require('../sqlModel/landProduct.js')
const { LandProductCodes, CommonCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/**
	业务函数:
		- findProductByGeo  // 根据经纬度查询ethland物品
    - getStarPoint // 得到当前的star point列表
    - 查询某个地址下所有商品 queryLandProductByAddr
    - 增加待投票的商品 addVoteProduct
    - 对商品进行投票 voteProduct
    - 商品投票结束 productVotedOver
    - 获得当前正在出售的商品 getCurrentProduct
    - 下架过期商品 dropOffProduct
    - 删除过期商品 deleteExpiredProduct
    - 兑换商品 exchangeProduct
	辅助函数:
		- cacl 计算最终的经纬度与长宽
    - geneStarPoint 商品产生核心点
*/
class LandProductController {
	constructor () {
    this.starPoint = [] // 商品中心点数组
    this.starCount = 5 // 中心点数量
    setInterval(() => {
      this.geneStarPoint()
    }, 5000)
	}

  /**
   * 对商品进行投票 addVoteProduct
   */
   async addVoteProduct (ctx) {
    const pwd = ctx.query['pwd']
    if (pwd !== 'chenye1234') return new Error(CommonCodes.No_Access)
    const productId = ctx.query['productId']
    const type = ctx.query['type']
    const productIdVali = await joiParamVali.valiProductId(productId)
    const typeVali = await joiParamVali.valiProductAttr(type)
    if (!productIdVali || !typeVali) {
      return new Error(CommonCodes.Params_Check_Fail)
    }
    const addVote = await landProductModel.addVoteProduct(productId, type)
    return addVote
  }

  /**
    * 查询某个地址下所有商品 queryLandProductByAddr
    */
  async queryLandProductByAddr (ctx) {
    if (!checkUserToken(ctx)) return new Error(CommonCodes.Token_Fail)
    const addr = ctx.query['addr']
    if (!addr) return new Error(CommonCodes.Params_Check_Fail)
    const products = await landProductModel.queryLandProductByAddr(addr)
    return products
  }

  /**
   * 增加待投票的商品 voteProduct
   */

  async voteProduct (ctx) {
    if (!checkUserToken(ctx)) return new Error(CommonCodes.Token_Fail)
    const voteNum = ctx.query['num']
    const productId = ctx.query['productId']
    const voteNumVali = await joiParamVali.valiBamboo(voteNum)
    const productIdVali = await joiParamVali.valiProductId(productId)
    if (!productIdVali || !voteNumVali) {
      return new Error(CommonCodes.Params_Check_Fail)
    }
    const votePro = await landProductModel.voteProduct(productId, voteNum)
    return votePro
  }

  /**
   * 商品投票结束 productVotedOver
   */
  async productVotedOver (ctx) {
    const pwd = ctx.query['pwd']
    if (pwd !== 'chenye1234') return new Error(CommonCodes.No_Access)
    const productSoldNum = 5
    const prepareProductArr = await landProductModel.getPrepareProduct()
    if (!prepareProductArr) return new Error(LandProductCodes.Get_Prepare_Product_Fail)
    const cutLen = prepareProductArr.length > productSoldNum ? productSoldNum: prepareProductArr.length
    prepareProductArr.sort((a, b) => {
      return parseInt(b.time) - parseInt(a.time)
    }).slice(0, cutLen)
    for (let pro of prepareProductArr) {
      const curTime = new Date().getTime() + 3 * 60 * 24 * 60
      const sellPro = await landProductModel.sellProduct(pro.productId, curTime)
      if (!sellPro) return new Error(LandProductCodes.Sell_Product_Fail)
    }
    const endVote = await landProductModel.endProductVote()
    return endVote
  }


  /**
   * 获得当前正在出售的商品 getCurrentProduct
   */
  async getCurrentProduct (ctx) {
    if (!checkUserToken(ctx)) return new Error(CommonCodes.Token_Fail)
    const curProduct = await landProductModel.getCurrentProduct()
    return curProduct
  }

  /**
   * 下架过期商品 dropOffProduct
   */
  async dropOffProduct () {
    const curProduct = await landProductModel.getCurrentProduct()
    if (!curProduct || curProduct.length === 0) return
    let curTime = new Date().getTime()
    for (let pro of curProduct) {
      if (curTime > pro.time) {
        const dropPro = await landProductModel.productDropOff(pro.productId)
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
      if (delTime > pro.time) {
        const dropPro = await landProductModel.deleteProduct(pro.productId)
        if (!dropPro) return new Error(LandProductCodes.Del_Product_Fail)
      }
    }
  }

  /**
    * 兑换商品 exchangeProduct
    */
  async exchangeProduct (ctx) {
    if (!checkUserToken(ctx)) return new Error(CommonCodes.Token_Fail)
    const userAddr = ctx.query['addr']
    const productId = ctx.query['productId']
    const userRealAddr = ctx.query['userRealAddr']
    const userPhone = ctx.query['userPhone']
    const userAddrVali = await joiParamVali.valiAddr(userAddr)
    const productIdVali = await joiParamVali.valiProductId(productId)
    const userPhoneVali = await joiParamVali.valiPhone(userPhone)
    if (!userPhoneVali || !productIdVali || !userPhoneVali || !userRealAddr) {
      return new Error(CommonCodes.Params_Check_Fail)
    }
    const specifiedPro = await landProductModel.querySpecifiedProByAddr(userAddr, productId)
    if (!specifiedPro || specifiedPro.length === 0 || parseInt(specifiedPro[0].value) < 1) {
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
    return new Promise((resolve, reject) => {
      trans.beginTransaction(function (bErr) {
        if (bErr) {
          reject(bErr)
          return
        }
        async.waterfall(tasks, function (tErr, res) {
          if (tErr) {
            trans.rollback(function () {
              trans.release()
              reject(tErr)
            })
          } else {
            trans.commit(function (err, info) {
              if (err) {
                console.log('err', err)
                trans.rollback(function (err) {
                  trans.release()
                  reject(err)
                })
              } else {
                trans.release()
                resolve(res)
              }
            })
          }
        })
      })
    })
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

  geneStarPoint () {
    this.starPoint = []
    for (let i = 0; i < this.starCount; i++) {
      let longitude = parseFloat(Math.random().toFixed(3) * 360) - 180
      let latitude = parseFloat(Math.random().toFixed(3) * 180) - 90
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