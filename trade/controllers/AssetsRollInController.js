const AssetsRollInModel = require('../models/AssetsRollInModel.js')
const assetsRollInModel = new AssetsRollInModel()

// const { assetsRollIn } = require('../sqlModel/assetsRollIn.js')
const { AssetsCodes, errorRes, serviceError, succRes, CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { checkUserToken } = require('../libs/CommonFun.js')

/**
 * @AssetsRollInController
 *  - 查询数据库中提现订单 queryAllRollInAssets
 *  - 查询某一特定用户的提现订单 queryRollInAssetsByAddr
 *  - 提现订单确认 checkOverRollInOrder
 *  - 提现订单取消 deleteRollInOrder
 *  - 新增一个充值订单 insertAssetsRollInOrder
 */

class AssetsRollInController {
	constructor () {

	}

	// 接口权限控制！important
	checkAuth (ctx) {
		// if (ctx.query['rootPwd'] && ctx.query['rootPwd'] === 'chenye1234') {
		// 	return true
		// } else {
		// 	return false
		// }
		return true
	}

	// 查询数据库中资产用户
	async queryAllRollInAssets (ctx) {
		if (!this.checkAuth(ctx)) return new Error(CommonCodes.Auth_Fail)
		let ctxRes = null
		const allOrder = await assetsRollInModel.queryAllRollInAssets()
		return allOrder
	}

	// 新增一个充值订单 
	async insertAssetsRollInOrder (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const type = ctx.query['type'].toLowerCase()
		const amount = ctx.query['amount']
		const addr = ctx.query['addr']
		const userAddr = ctx.query['userAddr']
		const rollIn = await assetsRollInModel.insertAssetsRollInOrder(type, amount, addr, userAddr)
		return rollIn
	}

	// 查询某一特定用户的转入资产
	async queryRollInAssetsByAddr (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		let addr = ctx.query['addr']
		const personOrder = await assetsRollInModel.queryRollInAssetsByAddr(addr)
		return personOrder
	}

	// 转入订单确认
	async checkOverRollInOrder (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		let type = assetsData.type.toLowerCase()
		let count = assetsData.count
		let addr = assetsData.addr
		const addAssets = await assetsRollInModel.changeUserLandAssets(type, count, addr, 'add')
		if (!addAssets) return addAssets
		const checkOrder = await assetsRollInModel.changeRollInOrderState(orderId, state)
		return checkOrder 
	}

	// 转入订单取消 TODO 与转入订单确认逻辑一样
	async deleteRollInOrder (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		const checkOrder = await assetsRollInModel.changeRollInOrderState(orderId, state)
		return checkOrder 
	}
}

module.exports = AssetsRollInController