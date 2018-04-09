const async = require('async')
const TransactionModel = require('../models/TransactionModel.js')
const { cacl } = require('../libs/CommonFun.js')
const { PandaOwnerCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')
// const LandProductController = require('./LandProductController.js')
// const PandaOwnerController = require('./PandaOwnerController.js')
// const LandAssetsController = require('./LandAssetsController.js')
// const LoginController = require('./LoginController.js')
// const loginController = new LoginController()
// const landProductController = new LandProductController()
// const pandaOwnerController = new PandaOwnerController()
// const landAssetsController = new LandAssetsController()

const transactionModel = new TransactionModel()
let bambooTitudeRate = 1000 // 竹子/经纬度 比例
let currentEthPrice = 3000
let currentBambooPrice = 1
let currentWaterPrice = 3

/**
	@TransactionController 事务controller
	- getEthlandProduct 熊猫外出获取宝物
	- buyPanda 购买熊猫
*/

class TransactionController {

	buyPanda (addr, pandaGen, price) {
		let trans = null
		let tasks = [
			function (callback) {
				transactionModel.startTransaction()
				.then(v => {
					console.log('begin transaction!')
					trans = v
					callback(null, v)
				})
				.catch(err => {
					callback(new Error('Transaction begin fail.'))
				})
			},
			function (trans, callback) {
				transactionModel.queryPandaInfo(trans, pandaGen)
				.then(v => {
					if (v.length > 0) {
						if (v[0].state !== 'sold') {
							callback(new Error('Not Sold.'))
						}
						callback(null, trans, v[0].ownerAddr, v[0].bamboo)
					} else {
						callback(new Error('No such Panda.'))
					}
				})
				.catch(e => {
					callback(e)
				})
			},
			function (trans, ownerAddr, ownerbamboo, callback) {
				transactionModel.queryAssetsByAddr(trans, addr)
				.then(v => {
					if (v.length > 0) {
						if (v[0].bamboo > price) {
							callback(null, trans, v[0].bamboo, ownerAddr, ownerbamboo)
						} else {
							callback(new Error('less bamboo.'))
						}
					} else {
						callback(new Error('No such addr.'))
					}
				})
				.catch(e => {
					callback(e)
				})
			},
			function (trans, buybamboo, ownerAddr, ownerbamboo, callback) {
				let buyleft = parseFloat(buybamboo) - parseFloat(price) > 0 ? parseFloat(buybamboo) - parseFloat(price): 0
				let ownerleft = parseFloat(ownerbamboo) + parseFloat(price)
				transactionModel.updateAssetsByAddr(trans, addr, buyleft, ownerAddr, ownerleft)
				.then(v => {
					callback(null, v)
				})
				.catch(e => {
					callback(e)
				})
			}
		]
		return new Promise((resolve, reject) => {
			async.waterfall(tasks, function (err, res) {
				if (err) {
					console.log(err)
					trans.rollback()
					reject(errorRes(err))
				}
				trans.release()
				resolve(succRes('buy panda', res))
				// trans.rollback()
			})
		})
	}

	getEthlandProduct (geni, bamboo, direction) {
		let trans = null
		let tasks = [
			function (callback) {
				transactionModel.startTransaction()
				.then(v => {
					console.log('begin transaction!')
					trans = v
					callback(null, v)
				})
				.catch(err => {
					callback(new Error('Transaction begin fail.'))
				})
			},
			function (trans, callback) {
				console.log('geni', geni)
				transactionModel.getInfoForProduct(trans, geni)
				.then(pandaInfo => {
					console.log('pandaInfo', pandaInfo)
					if (pandaInfo[0]) {
						if (parseInt(pandaInfo[0].bamboo) < bamboo){
							callback(new Error('More Bamboo Than user Has.'))
						} else {
							let leftBamboo = parseInt(pandaInfo[0].bamboo) - bamboo
							transactionModel.updateLandAssetsByAddr(trans, pandaInfo[0].ownerAddr, 'bamboo', leftBamboo)
							.then(v => {
								console.log('get out panda detail info', pandaInfo[0])
								callback(null, trans, pandaInfo[0])
							})
							.catch(e => {
								callback(e)
							})
						}
					} else {
						callback(new Error('No Such Panda.'))
					}
				})
				.catch(v => {
					callback(v)
				})
			},
			function (trans, pandaInfo, callback) {
				let baseRate = parseFloat(bamboo / bambooTitudeRate)
				let addr = pandaInfo.ownerAddr
				let geoParams = cacl(pandaInfo.longitude, pandaInfo.latitude, baseRate, direction, pandaInfo.hungry, pandaInfo.speed)
				transactionModel.findProductByGeo(trans, geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
				.then(proArr => {
					if (proArr.length === 0) {
						callback(new Error('No Product'))
					} else {
						let attrArr = {
	            'speed': parseFloat(pandaInfo.speed),
	            'hungry': parseFloat(pandaInfo.hungry),
	            'gold': pandaInfo.goldCatch,
	            'wood': pandaInfo.woodCatch,
	            'water': pandaInfo.waterCatch,
	            'fire': pandaInfo.fireCatch,
	            'earth': pandaInfo.earthCatch
	          }
	          console.log('get out panda product', proArr)
						callback(null, trans, attrArr, addr, proArr)
					}
				})
				.catch(e => {
					callback(e)
				})
			},
			function (trans, attrArr, addr, proArr, callback) {
				let getDiffValue = (type) => {
          if (type === 'ETH') {
            return currentEthPrice
          }
          if (type === 'BAMBOO') {
            return currentBambooPrice
          }
          if (type === 'WATER') {
            return currentWaterPrice
          }
        }
        let mostValRes = [] // 价值最高的商品组合
        let itemRes = [] // 返回的商品组合
        let dropRes = [] // 丢弃的商品列表
        let saveRes = [] // 保存进数据库的商品列表
        let itemsVal = 0 // 返回的商品总值
        let mostVal = 0 // 价值最高的商品总值
        let baseVal = 0 // 基本的商品组合
        transactionModel.updatePandaAttr(trans, 'state', 'out', geni)
        let overTime = Date.parse(new Date()) / 1000 + 60 * 60 * 3
        transactionModel.updatePandaAttr(trans, 'price', overTime, geni)
        .then(v => {

        })
        .catch(e => {

        })
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
              saveRes.push(data.value)
              itemsVal += getDiffValue(data.value.split('/')[1]) * parseInt(data.value.split('/')[0])
              let finalAttrVal = attrArr[dataTypeArr[index]] + 0.1* Math.random().toFixed(4)
              // TODO updatePandaAttr是否用await
              transactionModel.updatePandaAttr(trans, dataTypeArr[index] + 'Catch', finalAttrVal, geni)	
            } else {
            	dropRes.push(data.value)
            }
          }
        })
        console.log('itemRes', itemRes)
        // 更新用户资产 TODO
        async.parallel([
        		function (cb) {
        			transactionModel.updateUserLandAssets(trans, addr, saveRes)
        			.then(v => {
        				console.log(v)
        				cb(null)
        			})
        			.catch(e => {
        				console.log('e', e)
        				cb(e)
        			})
        		}
        		// function (cb) {
        		// 	transactionModel.updateBackPandaAssets(trans, geni, saveRes.join('|'), dropRes.join('|'))
        		// 	.then(v => {
        		// 		cb(null)
        		// 	})
        		// 	.catch(e => {
        		// 		console.log('e', e)
        		// 		cb(e)
        		// 	})
        		// }
        	], 
        	function (err, results) {
        		if (err) {
        			callback(err)
        		}
        	})
        if (itemsVal > 0 && itemsVal < baseVal) {
          transactionModel.updatePandaAttr(trans, 'integral', 10, geni)
        }
        if (itemsVal > baseVal && itemsVal < mostVal) {
          transactionModel.updatePandaAttr(trans, 'integral', 20, geni)
        }
        if (itemsVal >= mostVal) {
          transactionModel.updatePandaAttr(trans, 'integral', 30, geni)
        }
        callback(null, trans, itemRes)
			},
			function (trans, itemRes, callback) {
				trans.commit(function(err) {
					if (err) {
						callback(err)
					}
			    callback(null, itemRes)
			  })
			}
		]
		return new Promise((resolve, reject) => {
			async.waterfall(tasks, function (err, res) {
				if (err) {
					console.log(err)
					trans.rollback()
					reject(errorRes(err))
				}
				trans.release()
				resolve(succRes('find product', res))
				// trans.rollback()
			})
		})
	}

	// todo 测试model层接口
  testApi (api) {
  	if (transactionModel[api]) {
  		return transactionModel[api]()
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

module.exports = TransactionController