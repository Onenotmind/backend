const crypto = require('crypto')
const _ = require('lodash')
const async = require('async')
const PandaOwnerModel = require('../models/PandaOwnerModel.js')
const pandaOwnerModel = new PandaOwnerModel()
const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()
const { getParamsCheck, postParamsCheck, decrypt, encrypt, geneToken, checkToken } = require('../libs/CommonFun.js')
const { PandaOwnerClientModel, AttrList } = require('../sqlModel/pandaOwner.js')
const { PandaOwnerCodes, AssetsCodes, errorRes, CommonCodes, PandaLandCodes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/*
  PandaOwnerController:
   - land
   	- 丢弃熊猫 delPandaByGen
   	- 产生一只熊猫
   		- 新用户获取G10熊猫 genePandaRandom
   		- 繁殖熊猫	sireNewPanda
   		- 用竹子孕育熊猫 producePandaByBamboo
   	- 熊猫外出时属性增强 updatePandaAttr
   	- 熊猫的等级积分更新
   	- 查询特定熊猫详细信息 queryPandaInfo
   	- 查询某个addr下所有熊猫 queryAllPandaByAddr
   	- 查询某只熊猫外出回归带的物品 getPandaBackAssets
   	- 出售熊猫 sellPanda
   	- 购买熊猫 buyPanda
   	- 孵化熊猫 sirePanda
   - market
   	- 查询当前所有待售熊猫 queryAllPandaBeSold
   	- 购买熊猫 buyMarketPanda
   - 辅助函数
   	- 随机属性产生 geneAttr
   	- 固定范围内随机值产生 geneAttrVal
   	- 繁殖后代时属性值混合产生 mixAttrBySire
   	- 繁殖后代时type混合产生 mixTypeBySire
   	- 校验参数是否合法 valiParams
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
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['gen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (!genVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const pandaInfo = await pandaOwnerModel.queryPandaInfo(gen)
		return pandaInfo
	}

	async queryAllPandaByAddr (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!addrVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const allPanda = await pandaOwnerModel.queryAllPandaByAddr(addr)
		if (!allPanda) return new Error(allPanda.message)
		return allPanda
	}

	async getPandaBackAssets (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (!genVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const backPanda = await pandaOwnerModel.pandaBackHome(gen)
		if (!backPanda) return backPanda
		const backAssets = await pandaOwnerModel.getPandaBackAssets(gen)
		return backAssets
	}

	// 增加熊猫对某种属性的探测属性
	async updatePandaAttr (attr, value, pandaGen) {
		const attrTypeVali = await joiParamVali.valiState(attr, AttrList)
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

	async queryAllPandaBeSold (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
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
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!addrVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const pandaCount = await pandaOwnerModel.queryAllPandaByAddr(addr)
		if (pandaCount && pandaCount.length > 0) {
			return new Error(PandaOwnerCodes.Already_Gene_Free_Panda)
		} 
		let geni = ''
		let pandaAttr = null
		let spAttr = []
		pandaAttr = this.geneAttr()
		let genTypeNum = 5
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
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		if (!genVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const sirePanda = await pandaOwnerModel.pandaBackHome(gen)
		return sirePanda
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
		let num = parseInt(Math.random() * 10)
		if (num < 10) {
			return '00' + num
		} else {
			return '010'
		}
	}

	// 属性值随机数产生
	geneAttrVal (val) {
		return parseInt(Math.random() * val) / 100
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
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		const price = ctx.query['price']
		// const tradePwd = ctx.query['tradePwd']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		const priceVali = await joiParamVali.valiAttr(price)
		// const pwdVali = await joiParamVali.valiPass(tradePwd)
		if (!genVali || !priceVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		// const checkPwd = await pandaOwnerModel.checkOwnerTradePwd(gen, tradePwd)
		// if (!checkPwd) return checkPwd
		const sellPanda = await pandaOwnerModel.sellPanda(gen, price)
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
  	const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const gen = ctx.query['pandaGen']
		// const tradePwd = ctx.query['tradePwd']
		const genVali = await joiParamVali.valiPandaGeni(gen)
		// const pwdVali = await joiParamVali.valiPass(tradePwd)
		if (!genVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		// const checkPwd = await pandaOwnerModel.checkOwnerTradePwd(gen, tradePwd)
		// if (!checkPwd) return checkPwd
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

  async buyPanda (addr, pandaGen, price) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('addr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const pandaInfo = await pandaOwnerModel.queryPandaInfo(pandaGen)
		if (!pandaInfo || pandaInfo[0].state !== 'sold') return new Error(PandaLandCodes.Panda_Not_Sold)
		const ownerAddr = pandaInfo[0].ownerAddr
		const bamboo = pandaInfo[0].bamboo
		const assets = await pandaOwnerModel.queryAssetsByAddr(addr)
		if (!assets || assets[0].bamboo < price) return new Error(PandaLandCodes.No_More_Bamboo_For_Out)
		const buyBamboo = assets[0].bamboo
		let buyleft = parseFloat(buybamboo) - parseFloat(price) > 0 ? parseFloat(buybamboo) - parseFloat(price): 0
		let ownerleft = parseFloat(ownerbamboo) + parseFloat(price)
		const updateAssets = await pandaOwnerModel.updateAssetsByAddr(addr, buyleft, ownerAddr, ownerleft)
		if (!updateAssets) return new Error(PandaLandCodes.Buy_Panda_Fail)
		return updateAssets
	}

	async getEthlandProduct (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('addr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = ['geni', 'bamboo', 'direction']
		const params= await postParamsCheck(ctx, paramsType)
		if (!params) return new Error(CommonCodes.Params_Check_Fail)
		const geni = params.geni
		const bamboo = params.bamboo
		const direction = params.direction
		const geniVali = await joiParamVali.valiPandaGeni(geni)
		const bambooVali = await joiParamVali.valiBamboo(bamboo)
		const directionVali = await joiParamVali.valiDir(direction)
		if (!geniVali || !bambooVali || !directionVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const trans = await pandaOwnerModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		const assetsValArr = await pandaOwnerModel.queryCurrentAssetsVal()
		if (!assetsValArr || assetsValArr.length === 0) return new Error(AssetsCodes.Assets_Null)
		let tasks = [
			async function () {
				const pandaInfo = await pandaOwnerModel.getInfoForProduct(trans, geni)
				if (!pandaInfo || pandaInfo.length === 0) return new Error(PandaLandCodes.No_Such_Panda)
				if (parseInt(pandaInfo[0].bamboo) < bamboo) return new Error(PandaLandCodes.No_More_Bamboo_For_Out)
				let leftBamboo = parseInt(pandaInfo[0].bamboo) - bamboo
				const updateLandAssets = await pandaOwnerModel.updateLandAssetsByAddrTrans(trans, pandaInfo[0].ownerAddr, 'bamboo', leftBamboo)
				if (!updateLandAssets) return new Error(CommonCodes.Service_Wrong)
				return pandaInfo[0]
			},
			async function (pandaInfo) {
				if (_.isError(pandaInfo)) return pandaInfo
				let baseRate = parseFloat(bamboo / bambooTitudeRate)
				let addr = pandaInfo.ownerAddr
				let geoParams = cacl(pandaInfo.longitude, pandaInfo.latitude, baseRate, direction, pandaInfo.hungry, pandaInfo.speed)
				const product = await pandaOwnerModel.findProductByGeo(trans, geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
				if (!product || product.length === 0) return new Error(PandaLandCodes.No_Product_In_Land)
				let attrArr = {
          'speed': parseFloat(pandaInfo.speed),
          'hungry': parseFloat(pandaInfo.hungry),
          'gold': pandaInfo.goldCatch,
          'wood': pandaInfo.woodCatch,
          'water': pandaInfo.waterCatch,
          'fire': pandaInfo.fireCatch,
          'earth': pandaInfo.earthCatch
        }
        return {
        	attrArr: attrArr,
        	addr: addr,
        	product: product
        }
			},
			async function (res) {
				if (_.isError(res)) return res
				const attrArr = res.attrArr
				const addr = res.addr
				const proArr = res.product
				let getDiffValue = (type) => {
           for (let pro of assetsValArr) {
           	if (type === pro.productId) {
           		return pro.value
           	}
           }
        }
        let mostValRes = [] // 价值最高的商品组合
        let itemRes = [] // 返回的商品组合
        let dropRes = [] // 丢弃的商品列表
        let saveRes = [] // 保存进数据库的资产列表
        let saveProRes = [] // 保存进数据库的商品列表
        let itemsVal = 0 // 返回的商品总值
        let mostVal = 0 // 价值最高的商品总值
        let baseVal = 0 // 基本的商品组合
        let overTime = Date.parse(new Date()) / 1000 + 60 * 60 * 3
        const startOut = await pandaOwnerModel.updatePandaLocationStateTrans(trans, 'out', overTime, geni)
        if (!startOut) return new Error(PandaLandCodes.Update_Panda_Attr_Fail)
        if (proArr.length >= 3) {
        	mostValRes = proArr.sort((a, b) => {
            let aVal = getDiffValue(a.value.split('/')[1]) * parseInt(a.value.split('/')[0])
            let bVal = getDiffValue(b.value.split('/')[1]) * parseInt(b.value.split('/')[0])
            return bVal - aVal
          }).slice(0,3)
        }
        for (let item of mostValRes) {
          mostVal += getDiffValue(item.value.split('/')[1]) * parseInt(item.value.split('/')[0])
        }
        let itemLen = mostValRes.length === 3 ? 2 : mostValRes.length -1
        if (itemLen < 0) return
        baseVal = getDiffValue(mostValRes[itemLen].value.split('/')[1]) * parseInt(mostValRes[itemLen].value.split('/')[0])
				proArr.forEach(data => {
          let dataTypeArr = data.type.split('|')
          for (let index in dataTypeArr) {
            // if (true) {
            if (Math.random() < attrArr[dataTypeArr[index]]) {
              itemRes.push(data)
              let curAssetsType = data.value.split('/')[1]
              if (curAssetsType === 'ETH' || curAssetsType === 'EOS') {
              	saveRes.push(data.value)
              } else {
              	saveProRes.push(data.value)
              }
              itemsVal += getDiffValue(data.value.split('/')[1]) * parseInt(data.value.split('/')[0])
              let finalAttrVal = attrArr[dataTypeArr[index]] + 0.1* Math.random().toFixed(4)
              // TODO updatePandaAttr是否用await
              transactionModel.updatePandaAttr(trans, dataTypeArr[index] + 'Catch', finalAttrVal, geni)	
							// if (!updateAttr) return new Error(PandaLandCodes.Update_Panda_Attr_Fail)            
            } else {
            	dropRes.push(data.value)
            }
          }
        })
        const updateLandAssets = await pandaOwnerModel.updateUserLandAssetsTrans(trans, addr, saveRes)
        if (!updateLandAssets) return new Error(PandaLandCodes.Update_Land_Assets_Fail)
        for (let landPro of saveProRes) {
        	const specifiedPro = await pandaOwnerModel.querySpecifiedProByAddr(addr, landPro.split('/')[1])
        	if (!specifiedPro) return new Error(LandProductCodes.Query_Product_Fail)
        	if (specifiedPro.length === 0) {
        		const insertPro = await pandaOwnerModel.insertLandProductToUser(trans, addr, landPro.split('/')[1], landPro.split('/')[0])
        		if (!insertPro) return new Error(LandProductCodes.Insert_Product_Fail)
        	} else {
        		const updatePro = await pandaOwnerModel.updateUserLandPro(trans, addr, landPro.split('/')[1], landPro.split('/')[0])
        		if (!updatePro) return new Error(LandProductCodes.Update_Product_Fail)
        	}
        }
       //  const backAssets = await transactionModel.updateBackPandaAssets(trans, geni, saveRes.join('|'), dropRes.join('|'))
      	// if (!backAssets) return new Error(PandaLandCodes.Back_Assets_Carry_Fail)
      	let finalIntegral = 10
      	if (itemsVal > 0 && itemsVal < baseVal) {
          finalIntegral = 10
        }
        if (itemsVal > baseVal && itemsVal < mostVal) {
          finalIntegral = 20
        }
        if (itemsVal >= mostVal) {
          finalIntegral = 30
        }
        const updateIntegral = await pandaOwnerModel.updatePandaAttrTrans(trans, 'integral', 30, geni)
        if (!updateIntegral) return new Error(PandaLandCodes.Update_Panda_Attr_Fail)
        // return new Error('PandaLandCodes.Update_Panda_Attr_Fail')
        return itemRes
			},
			function (res, callback) {
				if (_.isError(res)) {
					callback(res)
				} else {
					callback(null, res)
				}
			}
		]
		return new Promise((resolve, reject) => {
			trans.beginTransaction(function (bErr) {
				if (bErr) {
					reject(bErr)
					return
				}
				async.waterfall(tasks, function (tErr, res) {
		      if (tErr) {
		        trans.rollback(function () {
		          trans.release()
		          reject(tErr)
		        })
		      } else {
		        trans.commit(function (err, info) {
		          if (err) {
		            trans.rollback(function (err) {
		              trans.release()
		              reject(err)
		            })
		          } else {
		            trans.release()
		            resolve(res)
		          }
		        })
		      }
		    })
			})
		})
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