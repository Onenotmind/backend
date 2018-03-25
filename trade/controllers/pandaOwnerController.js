const PandaOwnerModel = require('../models/PandaOwnerModel.js')
const pandaOwnerModel = new PandaOwnerModel()

const { PandaOwnerClientModel } = require('../sqlModel/pandaOwner.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

class PandaOwnerController {
	constructor () {
	}

	// 根据熊猫基因查询熊猫
	queryPandaInfo (ctx) {
		let params = [PandaOwnerClientModel.pandaGeni]
		let data = this.getParamsCheck(ctx, params)
		let ctxRes = null
		return pandaOwnerModel.queryPandaInfo(data.pandaGen)
		.then(v => {
			return succRes('pandaGeni', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 增加熊猫对某种属性的探测属性
	updatePandaAttr (attr, value, pandaGen) {
		let ctxRes = null
		console.log('value', value)
		return pandaOwnerModel.updatePandaAttr(attr, value, pandaGen)
		.then(v => {
			return succRes('updatePandaAttr', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

	// 随机产生一只G10的熊猫
	genePandaRandom (addr) {
		let geni = ''
		let pandaAttr = null
		let spAttr = []
		pandaAttr = this.geneAttr()
		let genTypeNum = 5
		let integral = this.geneAttrVal(30)
		for (let i = 0; i < genTypeNum; i++) {
			geni += this.geneNumRandom()
		}
		for (let i = 0; i < 7; i++) {
			if (i === parseInt(pandaAttr.index)) {
				spAttr.push(this.geneAttrVal(30))
			} else {
				spAttr.push(this.geneAttrVal(20))
			}
		}
		return pandaOwnerModel.genePandaRandom(geni, addr, pandaAttr.type, ...spAttr, '', integral)
		.then(v => {
			return succRes('genePandaRandom', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
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
}

module.exports = PandaOwnerController