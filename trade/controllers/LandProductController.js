const LandProductModel = require('../models/LandProductModel.js')
const landProductModel = new LandProductModel()

const { LandProductClientModel } = require('../sqlModel/landProduct.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

class LandProductController {
	constructor () {
	}

	// 根据经纬度查询ethland物品
	findProductByGeo (longitude, latitude, wid, height) {
		let ctxRes = null
		return landProductModel.findProductByGeo(longitude, latitude, wid, height)
		.then(v => {
			return succRes('findProductByGeo', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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