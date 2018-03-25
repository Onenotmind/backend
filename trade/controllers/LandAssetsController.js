const LandAssetsModel = require('../models/LandAssetsModel.js')
const landAssetsModel = new LandAssetsModel()

const { LandAssetsClientModel } = require('../sqlModel/landAssets.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

class LandAssetsController {
	constructor () {
	}

	// 查询某个地址的资产
	queryAssetsByAddr (addr) {
		return landAssetsModel.queryAssetsByAddr(addr)
		.then(v => {
			return succRes('queryAssetsByAddr', v)
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

module.exports = LandAssetsController