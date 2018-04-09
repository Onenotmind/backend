const crypto = require('crypto')
const PandaOwnerModel = require('../models/PandaOwnerModel.js')
const pandaOwnerModel = new PandaOwnerModel()
const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()
const { PandaOwnerClientModel, AttrList } = require('../sqlModel/pandaOwner.js')
const { PandaOwnerCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

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

class PandaOwnerController {
	constructor () {
	}

	// 根据熊猫基因查询熊猫
	async queryPandaInfo (gen) {
		let paramsArr = [
			{
				val: gen,
				model: PandaOwnerClientModel.pandaGeni
			}
		]
		const paramsVali = await this.valiParams(paramsArr)
		if (!paramsVali) return
		return pandaOwnerModel.queryPandaInfo(gen)
		.then(v => {
			return succRes(PandaOwnerCodes.Query_Panda_Info_Normal, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	async queryAllPandaByAddr (addr) {
		return pandaOwnerModel.queryAllPandaByAddr(addr)
		.then(async v => {
			return succRes(PandaOwnerCodes.Query_Panda_By_Addr, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	async getPandaBackAssets (gen) {
		return pandaOwnerModel.getPandaBackAssets(gen)
		.then(async v => {
			return succRes('getPandaBackAssets', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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

	queryAllPandaBeSold () {
		return pandaOwnerModel.queryPandasByState('sold')
		.then(v => {
			return succRes('queryPandaAllBeSold', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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
	async genePandaRandom (addr) {
		const pandaCount = await pandaOwnerModel.queryAllPandaByAddr(addr)
		if (pandaCount && pandaCount.length > 0) {
			return errorRes(PandaOwnerCodes.Already_Gene_Free_Panda)
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
		return pandaOwnerModel.genePanda(geni, addr, pandaAttr.type, ...spAttr, '', integral, 'egg', 0)
		.then(v => {
			console.log('genePanda succ')
			return succRes(PandaOwnerCodes.Gene_Free_Panda_Succ, v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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

	sellPanda (gen, price) {
		return pandaOwnerModel.sellPanda(gen, price)
		.then(v => {
			return succRes('sellPanda', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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

  delPandaByGen (gen) {
  	return pandaOwnerModel.delPandaByGen(gen)
		.then(v => {
			return succRes('delPandaByGen', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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