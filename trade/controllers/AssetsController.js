const AssetsModel = require('../models/AssetsModel.js')
const assetsModel = new AssetsModel()

const { AssetsClientModel } = require('../sqlModel/assets.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/LoginErrorCodes.js')

class AssetsController {
	constructor () {

	}

	// 接口权限控制！important
	checkAuth () {

	}

	// 查询数据库中资产用户
	queryAllAssets (ctx) {
		let ctxRes = null
		return assetsModel.queryAllAssets()
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 【资产确认】重置ETH资产
	setEthAssets (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let uid = parseInt(assetsData.id)
		let count = parseInt(assetsData.count)
		return assetsModel.setEthAssets(count, uid)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			return serviceError()
		})
	}

	// 【资产确认】重置EOS资产
	setEosAssets (ctx) {
		let ctxRes = null
		let assetsData = ctx.request.body.assetsData
		let uid = parseInt(assetsData.id)
		let count = parseInt(assetsData.count)
		return assetsModel.setEosAssets(count, uid)
		.then(v => {
			return succRes(AssetsCodes.Assets_Data_Normal, v)
		})
		.catch(e => {
			return serviceError()
		})
	}
}

module.exports = AssetsController