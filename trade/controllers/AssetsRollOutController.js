const AssetsRollOutModel = require('../models/AssetsRollOutModel.js')
const assetsRollOutModel = new AssetsRollOutModel()

const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

class AssetsRollOutController {
	constructor () {

	}

	// 接口权限控制！important
	checkAuth () {

	}

	// 查询数据库中提现订单
	queryAllRollOutAssets (ctx) {
		let ctxRes = null
		return assetsRollOutModel.queryAllRollOutAssets()
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 查询某一特定用户的提现订单
	queryRollOutAssetsByAddr (ctx) {
		let ctxRes = null
		let addr = ctx.query['addr']
		return assetsRollOutModel.queryRollOutAssetsByAddr(addr)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		}) 
	}

	// 提现订单确认
	checkOverRollOutOrder (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		return assetsRollOutModel.changeRollOutOrderState(orderId, state)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		}) 
	}

	// 提现订单取消 TODO 与提现订单确认逻辑一样
	deleteRollOutOrder (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		return assetsRollOutModel.changeRollOutOrderState(orderId, state)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		}) 
	}
}

module.exports = AssetsRollOutController