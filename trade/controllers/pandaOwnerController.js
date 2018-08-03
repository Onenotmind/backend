const crypto = require('crypto')
const _ = require('lodash')
const async = require('async')
const PandaOwnerModel = require('../models/pandaOwnerModel.js')
const pandaOwnerModel = new PandaOwnerModel()
const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()
const { getParamsCheck, commitTrans, postParamsCheck, checkUserToken, decrypt, cacl, encrypt, geneToken, checkToken } = require('../libs/CommonFun.js')
const { PandaOwnerClientModel, PandaOwnerServerModel, AttrList } = require('../sqlModel/pandaOwner.js')
const { UserServerModel } = require('../sqlModel/user.js')
const { LandAssetsServerModel } = require('../sqlModel/landAssets.js')
const { LandProductServerModel } = require('../sqlModel/landProduct.js')
const { UserLandProductServerModel } = require('../sqlModel/userLandProduct.js')
const { BackPandaAssetsServerModel } = require('../sqlModel/backPandaAssets.js')
const { AssetsValueServerModel } = require('../sqlModel/assetsValue.js')
const { PandaOwnerCodes, AssetsCodes, errorRes, LandProductCodes, CommonCodes, PandaLandCodes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/*
  PandaOwnerController:
   - land
   	- 丢弃熊猫 delPandaByGen
   	- 产生一只熊猫
   		- 新用户获取G10熊猫 genePandaRandom
   		- 繁殖熊猫	sireNewPanda
   		- 用竹子孕育熊猫 producePandaByBamboo
   	- 熊猫外出时属性增强 updatePandaAttr
   	- 外出逻辑 getEthlandProduct
   	- 熊猫的等级积分更新 
   	- 查询特定熊猫详细信息 queryPandaInfo
   	- 查询某个addr下所有熊猫 queryAllPandaByAddr
   	- 查询熊猫外出回归带的物品 getPandaBackAssets
   	- 出售熊猫 sellPanda
   	- 购买熊猫 buyPanda
   	- 孵化熊猫 sirePanda
   	- 喂养熊猫 feedPanda
   - market
   	- 查询当前所有待售熊猫 queryAllPandaBeSold
   	- 购买熊猫 buyMarketPanda
   	- 取消出售熊猫 unSoldPanda
   - 辅助函数
   	- 随机属性产生 geneAttr
   	- 固定范围内随机值产生 geneAttrVal
   	- 繁殖后代时属性值混合产生 mixAttrBySire
   	- 繁殖后代时type混合产生 mixTypeBySire
   	- 校验参数是否合法 valiParams
   	- 商品中心与熊猫外出时范围计算 recognize
   	- 返回不同属性的商品中心地址 getDiffStarCenter
   	- 批量更新用户资产 batchUpdateUserAssets
   	- 查询某个地址下某个商品的个数 queryProductNumByAddr
   	- 计算呜喏的识别程度 caclIgnoreProduct
   	- 呜喏等级积分升级算法 intergeUpdateForOut
   	- 呜喏速度属性升级算法 speedUpdateForOut
   	- 呜喏其他属性升级算法 attrUpdateForOut
*/

let bambooTitudeRate = 1000 // 竹子/经纬度 比例
let currentEthPrice = 3000
let currentBambooPrice = 1
let currentWaterPrice = 3

class PandaOwnerController {
	constructor () {
	}

	// 根据熊猫基因查询熊猫
	async queryPandaInfo (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['gen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (_.isError(genVali)) return genVali
		const pandaInfo = await pandaOwnerModel.queryPandaInfo(gen)
		return pandaInfo
	}

	async queryAllPandaByAddr (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (_.isError(addrVali)) return addrVali
		const allPanda = await pandaOwnerModel.queryAllPandaByAddr(addr)
		return allPanda
	}

	async getPandaBackAssets (ctx) { // TODO 是否做事务
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const checkAddr = ctx.cookies.get('userAddr')
		const allOutPanda = await pandaOwnerModel.queryAllOutPandaByAddr(checkAddr)
		if (!allOutPanda || allOutPanda.length === 0) return new Error(PandaOwnerCodes.Not_Out_Panda)
		let backProducts = [] // 返回的所有商品
		let dropProducts = [] // 扔掉的所有商品
		let dropTypeTmpObj = {} // 返回的商品计算中间对象
		let backTypeTmpObj = {} // 扔掉的商品计算中间对象
		let resProducts = [] // 返回的最终商品数组
		let dropResProducts = [] // 扔掉的最终商品数组
		let backPandas = [] // 返回的panda基因
		const curDate =  Date.parse(new Date()) / 1000 // 当前时间
		// const trans = await pandaOwnerModel.startTransaction()
		// if (!trans) return new Error(CommonCodes.Service_Wrong)
		// let tasks = [
		// 	async function () {
		// 	}
		// ]
		for (let panda of allOutPanda) {
			if (curDate > panda[PandaOwnerServerModel.price.label]) {
				const backPanda = await pandaOwnerModel.pandaBackHome(panda[PandaOwnerServerModel.gen.label])
				if (!backPanda) return backPanda
				const backAssets = await pandaOwnerModel.getPandaBackAssets(panda[PandaOwnerServerModel.gen.label])
				if (!backAssets || backAssets.length === 0) return backAssets
				backPandas.push(panda[PandaOwnerServerModel.gen.label])
				if (backAssets[0][BackPandaAssetsServerModel.backAssets.label]) {
					const backAssetsArr = backAssets[0][BackPandaAssetsServerModel.backAssets.label].split('|')
					if (backAssetsArr.length > 0) {
						backProducts = backProducts.concat(backAssetsArr)
						/**
						 *	批量更新用户资产 batchUpdateUserAssets
						 */
						const batchUpdateUserAssets = async (addr, backAssetsArr) => {
							// TODO 先查询需要更新的商品是否加入用户资产数据库
		        	// 没有的话就insert
		        	// 有的话就update
							for (let [index, landPro] of backAssetsArr.entries()) {
					    	const specifiedPro = await pandaOwnerModel.querySpecifiedProByAddr(addr, landPro)
					    	if (!specifiedPro) return new Error(LandProductCodes.Query_Product_Fail)
					    	if (specifiedPro.length === 0) {
					    		const insertPro = await pandaOwnerModel.insertLandProductToUser(addr, landPro)
					    		if (!insertPro) return new Error(LandProductCodes.Insert_Product_Fail)
					    	} else {
					    		const updatePro = await pandaOwnerModel.updateUserLandPro(addr, landPro)
					    		if (!updatePro) return new Error(LandProductCodes.Update_Product_Fail)
					    	}
					    console.log(backAssetsArr.length)
						    if (index === backAssetsArr.length - 1) {
						    	return true
						    }
					    }
						}
						const updateUserAssets = await batchUpdateUserAssets(checkAddr, backAssetsArr)
						if (_.isError(updateUserAssets)) return updateUserAssets
					}
				}
				if (backAssets[0][BackPandaAssetsServerModel.dropAssets.label]) {
					const dropAssetsArr = backAssets[0][BackPandaAssetsServerModel.dropAssets.label].split('|')
					if (dropAssetsArr.length > 0) {
						dropProducts = dropProducts.concat(dropAssetsArr)
					}
				}
				// 删除某个熊猫下的所有backassets商品
				// const delBackAssets = await pandaOwnerModel.deleteBackPandaAssetsByGen(panda[PandaOwnerServerModel.gen.label])
				// if (_.isError(delBackAssets)) return delBackAssets
			}
		}
		// 带回去的商品
		if (backProducts.length > 0) {
			backProducts.forEach(function(x) {
				backTypeTmpObj[x] = (backTypeTmpObj[x] || 0) + 1
			})
			const typeArr = Object.keys(backTypeTmpObj)
			for (let type of typeArr) {
				const imgInfo = await pandaOwnerModel.queryLandProductInfo(type)
				if (!imgInfo) return imgInfo
				const item = {
					productId: type,
					imgSrc: imgInfo[0][LandProductServerModel.imgSrc.label],
					value: backTypeTmpObj[type]
				}
				resProducts.push(item)
			}
		}
		// 扔掉的商品
		if (dropProducts.length > 0) {
			dropProducts.forEach(function(x) { 
				dropTypeTmpObj[x] = (dropTypeTmpObj[x] || 0) + 1
			})
			const droptypeArr = Object.keys(dropTypeTmpObj)
			for (let type of droptypeArr) {
				const imgInfo = await pandaOwnerModel.queryLandProductInfo(type)
				if (!imgInfo) return imgInfo
				const item = {
					productId: type,
					imgSrc: imgInfo[0][LandProductServerModel.imgSrc.label],
					value: dropTypeTmpObj[type]
				}
				dropResProducts.push(item)
			}
		}
		return {
			resProducts: resProducts,
			dropProducts: dropResProducts,
			backPandas: backPandas
		}
	}

	// 增加熊猫对某种属性的探测属性
	async updatePandaAttr (attr, value, pandaGen) {
		const attrTypeVali = await joiParamVali.valiState(attr)
		const valVali = [
			{
				val: pandaGen,
				model: PandaOwnerClientModel.pandaGeni
			},
			{
				val: value,
				model: PandaOwnerClientModel.goldCatch
			}
		]
		if (!attrTypeVali && !valVali) return
		return pandaOwnerModel.updatePandaAttr(attr, value, pandaGen)
		.then(v => {
			return succRes('updatePandaAttr', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	/**
		*	取消出售熊猫 unSoldPanda
		*/
	async unSoldPanda (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const pandaGen = ctx.query['pandaGen']
		const pandaGenVali = await joiParamVali.valiPandaGeni(pandaGen)
		if (_.isError(pandaGenVali)) return pandaGenVali
		// 逻辑部分
		// 判断这只熊猫是否在addr下
		const checkAddr = ctx.cookies.get('userAddr')
		const pandaInfo = await pandaOwnerModel.queryPandaInfo(pandaGen)
		if (!pandaInfo || pandaInfo.length === 0) return new Error(PandaLandCodes.No_Such_Panda)
		if (pandaInfo[0][PandaOwnerServerModel.addr.label] !== checkAddr) return new Error(PandaLandCodes.No_Such_Panda)
		// 取消出售熊猫
		const cancelSoldPanda = await pandaOwnerModel.unSoldPanda(pandaGen)
		return cancelSoldPanda
	}

	async queryAllPandaBeSold (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const soldPanda = await pandaOwnerModel.queryPandasByState('sold')
		return soldPanda
	}

	buyMarketPanda (addr, pandaGen) {
		return pandaOwnerModel.transferPandaOwner(addr, pandaGen)
		.then(v => {
			return succRes('buyMarketPanda', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 随机产生一只G10的熊猫
	async genePandaRandom (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (_.isError(addrVali)) return addrVali
		const pandaCount = await pandaOwnerModel.queryAllPandaByAddr(addr)
		if (pandaCount && pandaCount.length > 0) {
			return new Error(PandaOwnerCodes.Already_Gene_Free_Panda)
		} 
		let geni = ''
		let pandaAttr = null
		let spAttr = []
		pandaAttr = this.geneAttr()
		let genTypeNum = 10
		let integral = this.geneAttrVal(30)
		for (let i = 0; i < genTypeNum; i++) {
			geni += this.geneNumRandom()
		}
		// geni = crypto.createHash('sha256').update(geni).digest()
		for (let i = 0; i < 7; i++) {
			if (i === parseInt(pandaAttr.index)) {
				spAttr.push(this.geneAttrVal(30))
			} else {
				spAttr.push(this.geneAttrVal(20))
			}
		}
		const genePanda = await pandaOwnerModel.genePanda(geni, addr, pandaAttr.type, ...spAttr, '', integral, 'egg', 0)
		return genePanda
	}

	async sirePanda (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (_.isError(genVali)) return genVali
		const sirePanda = await pandaOwnerModel.pandaBackHome(gen)
		return sirePanda
	}

	async feedPanda (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const account = parseInt(ctx.query['account'])
		const cookieAddr = ctx.cookies.get('userAddr')
		const assets = await pandaOwnerModel.queryAssetsByAddr(cookieAddr)
		if (!assets || parseInt(assets[0][LandAssetsServerModel.bamboo.label]) < account) return new Error(LandProductCodes.Insufficient_Bamboo_Balance)
		const leftBamboo = parseInt(assets[0][LandAssetsServerModel.bamboo.label]) - account
		const updateLandAssets = await pandaOwnerModel.updateLandAssetsByAddrTrans(null, cookieAddr, 'bamboo', leftBamboo)
		return updateLandAssets
	}

	sireNewPanda (fPanda, mPanda) {
		let newPandaAddr = Math.random() < 0.5 ? fPanda.ownerAddr : mPanda.ownerAddr
		let type = this.mixTypeBySire(fPanda.type, mPanda.type)
		let attrArr = ['speed', 'hungry', 'goldCatch', 'waterCatch', 'fireCatch', 'earthCatch', 'woodCatch']
		let attrValArr = []
		let integral = 0
		let rate = parseFloat(Math.random().toFixed(3))
		integral = parseInt(fPanda.integral * rate + mPanda.integral * (1-rate))
		for (let i = 0; i < attrArr.length; i++) {
			let attrVal = this.mixAttrBySire(fPanda[attrArr[i]], mPanda[attrArr[i]])
			attrValArr.push(attrVal)
		}
		return pandaOwnerModel.genePanda('0x789', newPandaAddr, type, ...attrValArr, '', integral, 'home', 0)
		.then(v => {
			return succRes('genePanda', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	producePandaByBamboo () {
  	
  }

	// 0~10随机数产生
	geneNumRandom () {
		let num = parseInt(Math.random() * 5) + 1
		// num = parseInt(num / 2) > 0 ? parseInt(num / 2) : 1
		return '00' + num
	}

	// 属性值随机数产生
	geneAttrVal (val) {
		return parseInt(Math.random() * val)
	}

	// 属性类型随机数产生
	geneAttr () {
		let val = parseInt(Math.random() * 10)
		let type = ''
		let index = 2
		if (val <= 0) {
			type = 'gold'
		} else if(val < 2) {
			type = 'water'
			index = 3
		} else if (val < 5) {
			type = 'wood'
			index = 4
		} else if (val < 7) {
			type = 'fire'
			index = 5
		} else{
			type = 'earth'
			index = 6
		}
		return {
			type: type,
			index: index
		}
	}

	async sellPanda (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const price = ctx.query['price']
		const paramsType = [
			{
				label: 'pandaGen',
				vali: 'valiPandaGeni'
			},
			{
				label: 'price',
				vali: 'valiPrice'
			}
		]
		const params= await getParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params
		const checkAddr = ctx.cookies.get('userAddr')
		// 查询某个地址所有未出售的熊猫，若熊猫总数只有一个，则不能卖熊猫
		const unsoldPandas = await pandaOwnerModel.queryAllPandaByAddr(checkAddr)
		if (!unsoldPandas || unsoldPandas.length < 2) return new Error(PandaLandCodes.Only_One_Unsold_Panda)
		// const checkPwd = await pandaOwnerModel.checkOwnerTradePwd(gen, tradePwd)
		// if (!checkPwd) return checkPwd
		const sellPanda = await pandaOwnerModel.sellPanda(gen, parseInt(price))
		return sellPanda
	}

  queryPandaBeSold () {
  	return pandaOwnerModel.genePandaRandom(geni, addr, pandaAttr.type, ...spAttr, '', integral)
		.then(v => {
			return succRes('genePandaRandom', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
  }

  async delPandaByGen (ctx) {
  	const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (_.isError(genVali)) return genVali
		const dropPanda = await pandaOwnerModel.delPandaByGen(gen)
		return dropPanda
  }
  mixAttrBySire (fathVal, mathVal) {
  	let rate = parseFloat(Math.random().toFixed(3))
  	return fathVal * rate + (1 - rate) * mathVal
  }

  mixTypeBySire (fathVal, mathVal) {
  	let fathTypeArr = fathVal.split('|')
  	let mathTypeArr = mathVal.split('|')
  	for (let i = 0; i < mathTypeArr.length; i++) {
  		if (fathTypeArr.indexOf(mathTypeArr[i]) === -1) {
  			fathTypeArr.push(mathTypeArr[i])
  		}
  	}
  	return fathTypeArr.join('|')
  }

  async valiParams (params) {
		for (let param of params) {
			await joiParamVali[param.model.type](param.val)
		}
		return true
  }

  async buyPanda (ctx) {
  	const addr = ctx.query['addr']
  	const pandaGen = ctx.query['pandaGen']
  	const price = ctx.query['price']
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const pandaInfo = await pandaOwnerModel.queryPandaInfo(pandaGen)
		if (!pandaInfo || pandaInfo[0][PandaOwnerServerModel.state.label] !== 'sold') return new Error(PandaLandCodes.Panda_Not_Sold)
		const ownerAddr = pandaInfo[0][PandaOwnerServerModel.addr.label]
		const totalPanda = pandaOwnerModel.queryTotalPandaByAddr(ownerAddr)
		if (!totalPanda || totalPanda.length >= 3) return new Error(PandaOwnerCodes.More_Than_Max_Panda)
		const ownerAssets = await pandaOwnerModel.queryAssetsByAddr(ownerAddr)
		if (!ownerAssets) return ownerAssets
		const bamboo = ownerAssets[0][LandAssetsServerModel.bamboo.label]
		const assets = await pandaOwnerModel.queryAssetsByAddr(addr)
		if (!assets || parseInt(assets[0][LandAssetsServerModel.bamboo.label]) < parseInt(price)) return new Error(LandProductCodes.Insufficient_Bamboo_Balance)
		const buyBamboo = assets[0][LandAssetsServerModel.bamboo.label]
		let buyleft = parseFloat(buyBamboo) - parseFloat(price) > 0 ? parseFloat(buyBamboo) - parseFloat(price): 0
		let ownerleft = parseFloat(bamboo) + parseFloat(price)
		const trans = await pandaOwnerModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		let tasks = [
			async function () {
				const updateAssets = await pandaOwnerModel.updateAssetsByAddr(trans, addr, buyleft)
				return updateAssets
			},
			async function (res) {
				if (_.isError(res)) return res
				const updateOwnerAssets = await pandaOwnerModel.updateAssetsByAddr(trans, ownerAddr, ownerleft)
				return updateOwnerAssets
			},
			async function (res) {
				if (_.isError(res)) return res
				const transPanda = await pandaOwnerModel.transferPandaOwner(trans, addr, pandaGen)
				return transPanda
			},
			function (res, callback) {
				if (_.isError(res)) {
					callback(res)
				} else {
					callback(null, res)
				}
			}
		]
		return commitTrans(trans, tasks)
	}

	async getEthlandProduct (ctx, starArr) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = [
			{
				label: 'pandaGen',
				vali: 'valiPandaGeni'
			},
			{
				label: 'bamboo',
				vali: 'valiBamboo'
			},
			{
				label: 'direction',
				vali: 'valiDir'
			}
		]
		const params= await getParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params
		const geni = params.pandaGen
		const self = this
		const bamboo = parseInt(params.bamboo)
		const direction = params.direction
		const tagsStr = ctx.query['tagsStr']
		const cookieAddr = ctx.cookies.get('userAddr')
		const assets = await pandaOwnerModel.queryAssetsByAddr(cookieAddr)
		if (!assets || parseInt(assets[0][LandAssetsServerModel.bamboo.label]) < bamboo) return new Error(LandProductCodes.Insufficient_Bamboo_Balance)
		const trans = await pandaOwnerModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		console.log('trans begin!')
		// const assetsValArr = await pandaOwnerModel.queryCurrentAssetsVal()
		// if (!assetsValArr || assetsValArr.length === 0) return new Error(AssetsCodes.Assets_Null)
		let tasks = [
			async function () {
				const pandaInfo = await pandaOwnerModel.getInfoForProduct(trans, geni)
				if (!pandaInfo || pandaInfo.length === 0) return new Error(PandaLandCodes.No_Such_Panda)
				if (parseInt(pandaInfo[0][LandAssetsServerModel.bamboo.label]) < bamboo) return new Error(PandaLandCodes.No_More_Bamboo_For_Out)
				let leftBamboo = parseInt(pandaInfo[0][LandAssetsServerModel.bamboo.label]) - bamboo
				const updateLandAssets = await pandaOwnerModel.updateLandAssetsByAddrTrans(trans, pandaInfo[0][LandAssetsServerModel.addr.label], 'bamboo', leftBamboo)
				if (!updateLandAssets) return new Error(CommonCodes.Service_Wrong)
				// console.log('pandaInfo', pandaInfo[0])
				return pandaInfo[0]
			},
			async function (pandaInfo) {
				if (_.isError(pandaInfo)) return pandaInfo
				let baseRate = parseFloat(bamboo / bambooTitudeRate)
				let addr = pandaInfo[PandaOwnerServerModel.addr.label]
				let geoParams = cacl(pandaInfo[UserServerModel.longitude.label], pandaInfo[UserServerModel.latitude.label], baseRate, direction, pandaInfo[PandaOwnerServerModel.hungry.label], pandaInfo[PandaOwnerServerModel.speed.label])
				// const product = await pandaOwnerModel.findProductByGeo(trans, geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
				console.log('geoParams', geoParams)
				let product = await pandaOwnerModel.findAllproduct()
				if (!product || product.length === 0) return new Error(PandaLandCodes.No_Product_In_Land)
				// product = product.filter(pro => tagsStr.indexOf(pro[LandProductServerModel.productType.label]) !== -1)
				// 筛选特定属性的商品
				const baseAttrArr = ['gold', 'wood', 'water', 'fire', 'earth']
				let recognizeAttrStr = ''
				for (let i = 0; i < starArr.length; i++) {
					const recognizeRate = self.recognize(starArr[i], geoParams)
					if (recognizeRate > 0.1) {
						recognizeAttrStr += baseAttrArr[i]
					}
				}
				console.log('pro', product)
				console.log(recognizeAttrStr)
				product = product.filter(pro => recognizeAttrStr.indexOf(pro[LandProductServerModel.type.label]) !== -1)
				console.log('product..', product)
				let attrArr = {
          'speed': parseFloat(pandaInfo[PandaOwnerServerModel.speed.label]),
          'hungry': parseFloat(pandaInfo[PandaOwnerServerModel.hungry.label]),
          'gold': pandaInfo[PandaOwnerServerModel.goldCatch.label],
          'wood': pandaInfo[PandaOwnerServerModel.woodCatch.label],
          'water': pandaInfo[PandaOwnerServerModel.waterCatch.label],
          'fire': pandaInfo[PandaOwnerServerModel.fireCatch.label],
          'earth': pandaInfo[PandaOwnerServerModel.earthCatch.label],
          'integral': pandaInfo[PandaOwnerServerModel.integral.label]
        }
        // console.log({attrArr: attrArr,addr: addr,product: product,geoParams: geoParams})
        return {
        	attrArr: attrArr,
        	addr: addr,
        	product: product,
        	geoParams: geoParams
        }
			},
			// 测试 -- 没有属性更新
			async function (res) {
				if (_.isError(res)) return res
				const attrArr = res.attrArr
				const addr = res.addr
				const proArr = res.product
				const geoParams = res.geoParams
				let overTime = Date.parse(new Date()) / 1000 + 60 * 10 // 10s 后
				let saveProRes = [] // 保存进数据库的商品列表
				let dropRes = [] // 丢弃的商品列表
				const startOut = await pandaOwnerModel.updatePandaLocationStateTrans(trans, 'out', overTime, geni)
        if (!startOut) return new Error(PandaLandCodes.Update_Panda_Attr_Fail)
        for (let pro of proArr) {
        	const proInfo = await pandaOwnerModel.queryLandProductInfo(pro[LandProductServerModel.productId.label])
        	if (!proInfo) return proInfo
        	if (parseInt(proInfo[0][LandProductServerModel.leftCount.label]) < 1) {
        		continue
        	}
        	// 获取商品的属性
        	const proAttr = proInfo[0][LandProductServerModel.type.label]
        	const proCount = await self.queryProductNumByAddr(addr, pro[LandProductServerModel.productId.label])
        	if (_.isError(proCount)) return proCount
        	// TODO 获取概率
        	if (Math.random() < self.caclIgnoreProduct(proCount, attrArr[proAttr])) {
        		saveProRes.push(pro[LandProductServerModel.productId.label])
        		// 当已有商品碎片为2时，landproduct表中对应leftCount应减去一个
        		if (proCount === 2) {
        			const minusPro = await pandaOwnerModel.minusProductCount(pro[LandProductServerModel.productId.label])
        			if (!minusPro) return minusPro
        		}
        	const speedRate = self.speedUpdateForOut(proCount, bamboo, attrArr.integral)
        	const attrBaseAttr = self.attrUpdateForOut(proCount, proAttr, attrArr.integral)
        	const integralRate = self.intergeUpdateForOut(proCount, attrArr.integral)
        	const pandaAttrArr = [speedRate, speedRate, ...attrBaseAttr, integralRate]
        	const attrUpdate = await pandaOwnerModel.updatePandaAttribute(pandaAttrArr, geni, trans)
        	if (!attrUpdate) return attrUpdate
        	} else {
        		// TODO 失败时属性更新
        		dropRes.push(pro[LandProductServerModel.productId.label])
        	}
        }
        // 先查询该熊猫是否在backassets里还有数据 TODO
        // 若没有就插入
        // 有的话就删除这些数据再插入
        const querySelectedPro = await pandaOwnerModel.queryBackPandaAssetsByGen(geni)
        if (!querySelectedPro) return querySelectedPro
        if (querySelectedPro.length > 0) {
        	const delBackAssets = await pandaOwnerModel.deleteBackPandaAssetsByGen(geni, trans)
	      	if (!delBackAssets) {
	      		return new Error(PandaLandCodes.Delete_Back_Assets_Fail)
	      	}
        }
        const insertBackAssets = await pandaOwnerModel.updateBackPandaAssetsTrans(trans, addr, geni, saveProRes.length > 0 ? saveProRes.join('|') : null, dropRes.length> 0 ? dropRes.join('|') : null)
      	if (!insertBackAssets) return new Error(PandaLandCodes.Back_Assets_Carry_Fail)
      	return saveProRes
			},
			function (res, callback) {
				if (_.isError(res)) {
					callback(res)
				} else {
					callback(null, res)
				}
			}
		]
		return commitTrans(trans, tasks)
	}

	/**
		*	返回不同属性的商品中心地址 getDiffStarCenter
		*/
	getDiffStarCenter (starArr, type) {
		if (type === 'gold') {
			return starArr[0]
		}
		if (type === 'wood') {
			return starArr[1]
		}
		if (type === 'water') {
			return starArr[2]
		}
		if (type === 'fire') {
			return starArr[3]
		}
		if (type === 'earth') {
			return starArr[4]
		}
	}
	/**
		*	商品中心与熊猫外出时范围计算 recognize
		* 返回 经度与纬度的相对比例
		*/
	recognize (starPos, geoParams) {
		const caclLongi = starPos[0] - geoParams.longitude
		const caclLati = starPos[1] - geoParams.latitude
		const spreadWid = 180
		let longRate = 0
		let latiRate = 0
		if (caclLongi < 0 && Math.abs(caclLongi) <= 180) {
			longRate = 1 - Math.abs(caclLongi) / 180
		}
		if (caclLongi < 0 && Math.abs(caclLongi) > 180) {
			longRate = 1 - (360 + geoParams.width + caclLongi) / 180
		}
		if (caclLongi >= 0 && Math.abs(caclLongi) <= 180) {
			longRate = 1 - Math.abs(caclLongi - geoParams.width < 0? 0:caclLongi - geoParams.width) / 180
		}
		if (caclLongi >= 0 && Math.abs(caclLongi) > 180) {
			longRate = 1 - (360 - caclLongi) / 180
		}
		if (caclLati >= 0 && caclLati <= 90) {
			latiRate = 1 - caclLati / 90
		}
		if (caclLati >= 0 && caclLati > 90) {
			latiRate = 0
		}
		if (caclLati < 0 && Math.abs(caclLati) <= 90) {
			latiRate = 1 - Math.abs(caclLati + geoParams.height) / 90
		}
		if (caclLati < 0 && Math.abs(caclLati) > 90) {
			latiRate = 0
		}
		return parseFloat(latiRate * longRate).toFixed(4)
	}

	/**
	 * 查询某个地址下某个商品的个数 queryProductNumByAddr
	 */
	async queryProductNumByAddr (addr, productId) {
		// 查看带回家的未计算的同类商品数量
		const userBackAssets = await pandaOwnerModel.getPandaBackAssetsByAddr(addr)
		if (!userBackAssets) return userBackAssets
		let count = 0
		for (let pro of userBackAssets) {
			if (userBackAssets[BackPandaAssetsServerModel.backAssets.label]) {
				const backAssetsStr = userBackAssets[BackPandaAssetsServerModel.backAssets.label]
				if (backAssetsStr.indexOf(productId) !== -1) {
					count++
				}
			}
		}
		const userProducts = await pandaOwnerModel.querySpecifiedProByAddr(addr, productId)
		if (!userProducts) return userProducts
		if (userProducts.length > 0) {
			count = count + parseInt(userProducts[0][UserLandProductServerModel.value.label])
		}
		return count
	}

	/**
	 * 计算呜喏的识别商品程度 caclIgnoreProduct
	 */
	caclIgnoreProduct (count, attrRate) {
		if (count === 0) return 0.6
		if (count === 1) return 0.4
		if (count === 2) return attrRate / 100
		if (count >= 3) return 0
	}

	/**
	 * 呜喏等级积分升级算法 intergeUpdateForOut
	 */
	intergeUpdateForOut (count, integral) {
		if (count === 0) return 10
		if (count === 1) return 30
		if (count === 2) return 50
	}

	/**
	 * 呜喏速度属性升级算法 speedUpdateForOut
	 */
	speedUpdateForOut (count, bamboo, integral) {
		let bambooRate = 0.6
		if (parseInt(bamboo / integral) >= 10) {
			bambooRate = 1
		}
		let countRate = 0.3
		switch (count) {
			case 0:
			 countRate = 0.3
			 break
			case 1:
				countRate = 0.5
				break
			case 2:
				countRate = 1
				break
			default:
				break
		}
		return countRate * bambooRate
	}

	/**
	 * 呜喏其他属性升级算法 attrUpdateForOut
	 */
	attrUpdateForOut (count, attr, integral) {
		const integralRate = parseInt(integral) >= 500 ? 0.5:1
		/**
		 * 按照 金木水火土 排序。比例为选中者 0.4 其他 0.15
		 */
		let countRate = 0.3
		switch (count) {
			case 0:
			 countRate = 0.3
			 break
			case 1:
				countRate = 0.5
				break
			case 2:
				countRate = 1
				break
			default:
				break
		}
		countRate = countRate * integralRate
		const attrArr = [
			attr === 'gold' ? countRate * 0.4 : countRate * 0.15,
			attr === 'wood' ? countRate * 0.4 : countRate * 0.15,
			attr === 'water' ? countRate * 0.4 : countRate * 0.15,
			attr === 'fire' ? countRate * 0.4 : countRate * 0.15,
			attr === 'earth' ? countRate * 0.4 : countRate * 0.15
		]
		return attrArr
	}

  // todo 测试model层接口
  testApi (api) {
  	if (pandaOwnerModel[api]) {
  		return pandaOwnerModel[api]()
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

module.exports = PandaOwnerController