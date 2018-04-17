const LandProductModel = require('../models/LandProductModel.js')
const landProductModel = new LandProductModel()

const { LandProductClientModel } = require('../sqlModel/landProduct.js')
const { AssetsCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/**
	业务函数:
		- findProductByGeo  // 根据经纬度查询ethland物品
    - getStarPoint // 得到当前的star point列表
	辅助函数:
		- cacl 计算最终的经纬度与长宽
    - geneStarPoint 商品产生核心点
*/
class LandProductController {
	constructor () {
    this.starPoint = [] // 商品中心点数组
    this.starCount = 5 // 中心点数量
    setInterval(() => {
      this.geneStarPoint()
    }, 5000)
	}

	findProductByGeo (longitude, latitude, rate, direction, hungry, speed) {
		// TODO 参数校验
		let geoParams = this.cacl(longitude, latitude, rate, direction, hungry, speed)
		let ctxRes = null
		return landProductModel.findProductByGeo(geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
		.then(v => {
			console.log(v)
			return succRes('findProductByGeo', v)
		})
		.catch(e => {
			console.log(e)
			return serviceError()
		})
	}

  geneStarPoint () {
    this.starPoint = []
    for (let i = 0; i < this.starCount; i++) {
      let longitude = parseFloat(Math.random().toFixed(3) * 360) - 180
      let latitude = parseFloat(Math.random().toFixed(3) * 180) - 90
      this.starPoint.push([ longitude, latitude])
    }
  }

  getStarPoint () {
    return this.starPoint
  }

	cacl (long, lati, rate, direction, hungry, speed) {
    let tmpWidth = 0
    let tmpHeight = 0
    if (direction === 'east') {
      tmpWidth = rate * (hungry / 100)
      tmpHeight = rate * (speed / 100)
      lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
    } else if (direction === 'west') {
      tmpWidth = rate * (hungry / 100)
      tmpHeight = rate * (speed / 100)
      lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else if (direction === 'north') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    } else if (direction === 'south') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
    } else if (direction === 'northEast') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    } else if (direction === 'northWest') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else if (direction === 'southEast') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
    } else if (direction === 'southWest') {
      tmpWidth = rate * (speed / 100)
      tmpHeight = rate * (hungry / 100)
      long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
    } else {}
    return {
      longitude: long,
      latitude: lati,
      width: tmpWidth,
      height: tmpHeight
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

module.exports = LandProductController