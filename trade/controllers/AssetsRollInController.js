const AssetsRollInModel = require('../models/AssetsRollInModel.js')
const assetsRollInModel = new AssetsRollInModel()

const { assetsRollIn } = require('../sqlModel/assetsRollIn.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/LoginErrorCodes.js')

class AssetsRollInController {
	constructor () {

	}

	// 接口权限控制！important
	checkAuth () {

	}

	// 查询数据库中资产用户
	queryAllRollInAssets (ctx) {
		let ctxRes = null
		return assetsRollInModel.queryAllRollInAssets()
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 查询某一特定用户的转入资产
	queryRollInAssetsByAddr (ctx) {
		let ctxRes = null
		let addr = ctx.query['addr']
		return assetsRollInModel.queryRollInAssetsByAddr(addr)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		}) 
	}

	// 转入订单确认
	checkOverRollInOrder (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		return assetsRollInModel.checkOverRollInOrder(orderId, state)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		}) 
	}
}

module.exports = AssetsRollInController