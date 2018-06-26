const AssetsRollOutModel = require('../models/AssetsRollOutModel.js')
const assetsRollOutModel = new AssetsRollOutModel()

const { AssetsCodes, errorRes, LoginCodes, serviceError, succRes, CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { checkUserToken } = require('../libs/CommonFun.js')
const { UserServerModel } = require('../sqlModel/user.js')
/**
 * @AssetsRollOutController
 *  - 查询数据库中提现订单 queryAllRollOutAssets
 *  - 查询某一特定用户的提现订单 queryRollOutAssetsByAddr
 *  - 提现订单确认 checkOverRollOutOrder
 *  - 提现订单取消 deleteRollOutOrder
 *  - 新增一个提现订单 insertAssetsRollOutOrder
 */


class AssetsRollOutController {
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

	// 查询数据库中提现订单
	async queryAllRollOutAssets (ctx) {
		if (!this.checkAuth(ctx)) return new Error(CommonCodes.Auth_Fail)
		let ctxRes = null
		const allOrder = await assetsRollOutModel.queryAllRollOutAssets()
		return allOrder
	}

	async insertAssetsRollOutOrder (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		let addr = ctx.cookies.get('userAddr')
		let receiver = ctx.query['addr']
		let type = ctx.query['type']
		let amount = ctx.query['amount']
		let pwd = ctx.query['pwd']
		const realPwd = await assetsRollOutModel.queryUserTradePwd(addr)
    if (!realPwd) return realPwd
    if (realPwd[0][UserServerModel.tradePwd.label] !== pwd) return new Error(LoginCodes.Trade_Pwd_Wrong)
		const assets = await assetsRollOutModel.queryLandAssetsByAddr(addr)
		if (!assets || assets.length === 0) return assets
		if (parseFloat(assets[0][type.toLowerCase()]) < parseFloat(amount)) return new Error(CommonCodes.Assets_Not_Enought)
		// TODO 是否事务
		const order = await assetsRollOutModel.insertAssetsRollOutOrder(addr, receiver, type.toLowerCase(), amount)
		if (!order) return order
		const rollOut = await assetsRollOutModel.rollOutAssets(type.toLowerCase(), amount, addr, 'out')
		return rollOut
	}

	// 查询某一特定用户的提现订单
	async queryRollOutAssetsByAddr (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		let addr = ctx.query['addr']
		const personOrder = await assetsRollOutModel.queryRollOutAssetsByAddr(addr)
		console.log(personOrder)
		return personOrder
	}

	// 提现订单确认
	async checkOverRollOutOrder (ctx) {
		// if (!this.checkAuth(ctx)) return new Error(CommonCodes.Auth_Fail)
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		let type = assetsData.type.toLowerCase() + 'Lock'
		const addAssets = await assetsRollOutModel.changeUserLandAssets(type, assetsData.count, assetsData.addr, 'minus')
		if (!addAssets) return addAssets
		const checkOrder = await assetsRollOutModel.changeRollOutOrderState(orderId, state)
		return checkOrder 
	}

	// 提现订单取消 TODO 与提现订单确认逻辑一样
	async deleteRollOutOrder (ctx) {
		// if (!this.checkAuth(ctx)) return new Error(CommonCodes.Auth_Fail)
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		let state = assetsData.state
		const rollOut = await assetsRollOutModel.rollOutAssets(assetsData.type.toLowerCase(), assetsData.count, assetsData.addr, 'back')
		if (!rollOut) return rollOut
		const checkOrder = await assetsRollOutModel.changeRollOutOrderState(orderId, state)
		return checkOrder 
	}
}

module.exports = AssetsRollOutController