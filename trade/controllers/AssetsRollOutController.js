const AssetsRollOutModel = require('../models/AssetsRollOutModel.js')
const assetsRollOutModel = new AssetsRollOutModel()
const _ = require('lodash')
const { AssetsCodes, errorRes, LoginCodes, serviceError, succRes, CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { checkUserToken } = require('../libs/CommonFun.js')
const { UserServerModel } = require('../sqlModel/user.js')
const { AssetsRollOutServerModel } = require('../sqlModel/assetsRollOut.js')
/**
 * @AssetsRollOutController
 *  - 查询数据库中提现订单 queryAllRollOutAssets
 *  - 查询某一特定用户的提现订单 queryRollOutAssetsByAddr
 *  - 提现订单确认 checkOverRollOutOrder
 *  - 提现订单取消 deleteRollOutOrder
 *  - 用户手动取消订单 clientCancelRollOutOrder
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
		if (parseInt(assetsData.count) <= 0) {
			return new Error('count not illegal!')
		}
		const addAssets = await assetsRollOutModel.changeUserLandAssets(type, assetsData.count, assetsData.addr, 'minus')
		if (!addAssets) return addAssets
		const checkOrder = await assetsRollOutModel.changeRollOutOrderState(orderId, state)
		return checkOrder 
	}

	// 提现订单取消
	async deleteRollOutOrder (ctx) {
		// if (!this.checkAuth(ctx)) return new Error(CommonCodes.Auth_Fail)
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let orderId = parseInt(assetsData.orderId)
		// let state = assetsData.state
		let state = 'cancel'
		const rollOut = await assetsRollOutModel.rollOutAssets(assetsData.type.toLowerCase(), assetsData.count, assetsData.addr, 'back')
		if (!rollOut) return rollOut
		const checkOrder = await assetsRollOutModel.changeRollOutOrderState(orderId, state)
		return checkOrder 
	}

	// 用户手动取消订单
	async clientCancelRollOutOrder (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const orderId = parseInt(ctx.query['orderId'])
		// 根据orderid获取相关信息
		const info = await assetsRollOutModel.queryAssetsRollOutById(orderId)
		console.log(info)
		if (_.isError(info)) return info
		if (info[AssetsRollOutServerModel.state.label] !== 'pending') return new Error(CommonCodes.Service_Wrong)
		if (info[AssetsRollOutServerModel.addr.label] !== addr) return new Error(CommonCodes.Service_Wrong)
		const rollOut = await assetsRollOutModel.rollOutAssets(info[AssetsRollOutServerModel.type.label].toLowerCase(), info[AssetsRollOutServerModel.amount.label], addr, 'back')
		if (!rollOut) return rollOut
		const checkOrder = await assetsRollOutModel.changeRollOutOrderState(orderId, 'cancel')
		return checkOrder
	}
}

module.exports = AssetsRollOutController