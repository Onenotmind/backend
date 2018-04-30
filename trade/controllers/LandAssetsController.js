const LandAssetsModel = require('../models/LandAssetsModel.js')
const landAssetsModel = new LandAssetsModel()

const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()

const { LandAssetsClientModel } = require('../sqlModel/landAssets.js')
const { CommonCodes, LandProductCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/**
	@LandAssetsController
		
*/

class LandAssetsController {
	constructor () {
	}

	// 查询某个地址的资产
	queryAssetsByAddr (addr) {
		return landAssetsModel.queryAssetsByAddr(addr)
		.then(v => {
			return v[0]
		})
		.catch(e => {
			return e
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

  // todo 测试model层接口
  testApi (api) {
  	if (landAssetsModel[api]) {
  		return landAssetsModel[api]()
			.then(v => {
				return succRes('testApi', v)
			})
			.catch(e => {
				console.log(e)
				return serviceError()
			})
  	} else {
  		console.log('api')
  	}
  }
}

module.exports = LandAssetsController