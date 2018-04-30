const _ = require('lodash')
const async = require('async')
const TransactionModel = require('../models/TransactionModel.js')
const JoiParamVali = require('../libs/JoiParamVali.js')
const { cacl, geneToken, checkToken } = require('../libs/CommonFun.js')
const { PandaOwnerCodes, PandaLandCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

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

	async buyPanda (addr, pandaGen, price) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('addr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const pandaInfo = await transactionModel.queryPandaInfo(pandaGen)
		if (!pandaInfo || pandaInfo[0].state !== 'sold') return new Error(PandaLandCodes.Panda_Not_Sold)
		const ownerAddr = pandaInfo[0].ownerAddr
		const bamboo = pandaInfo[0].bamboo
		const assets = await transactionModel.queryAssetsByAddr(addr)
		if (!assets || assets[0].bamboo < price) return new Error(PandaLandCodes.No_More_Bamboo_For_Out)
		const buyBamboo = assets[0].bamboo
		let buyleft = parseFloat(buybamboo) - parseFloat(price) > 0 ? parseFloat(buybamboo) - parseFloat(price): 0
		let ownerleft = parseFloat(ownerbamboo) + parseFloat(price)
		const updateAssets = await transactionModel.updateAssetsByAddr(addr, buyleft, ownerAddr, ownerleft)
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
		const trans = await transactionModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		let tasks = [
			async function () {
				const pandaInfo = await transactionModel.getInfoForProduct(trans, geni)
				if (!pandaInfo || pandaInfo.length === 0) return new Error(PandaLandCodes.No_Such_Panda)
				if (parseInt(pandaInfo[0].bamboo) < bamboo) return new Error(PandaLandCodes.No_More_Bamboo_For_Out)
				let leftBamboo = parseInt(pandaInfo[0].bamboo) - bamboo
				const updateLandAssets = await transactionModel.updateLandAssetsByAddr(trans, pandaInfo[0].ownerAddr, 'bamboo', leftBamboo)
				if (!updateLandAssets) return new Error(CommonCodes.Service_Wrong)
				return pandaInfo[0]
			},
			async function (pandaInfo) {
				if (_.isError(pandaInfo)) return pandaInfo
				let baseRate = parseFloat(bamboo / bambooTitudeRate)
				let addr = pandaInfo.ownerAddr
				let geoParams = cacl(pandaInfo.longitude, pandaInfo.latitude, baseRate, direction, pandaInfo.hungry, pandaInfo.speed)
				const product = await transactionModel.findProductByGeo(trans, geoParams.longitude, geoParams.latitude, geoParams.width, geoParams.height)
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
        let saveRes = [] // 保存进数据库的资产列表
        let saveProRes = [] // 保存进数据库的商品列表
        let itemsVal = 0 // 返回的商品总值
        let mostVal = 0 // 价值最高的商品总值
        let baseVal = 0 // 基本的商品组合
        let overTime = Date.parse(new Date()) / 1000 + 60 * 60 * 3
        const startOut = await transactionModel.updatePandaLocationState(trans, 'out', overTime, geni)
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
              saveRes.push(data.value)
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
        const updateLandAssets = await transactionModel.updateUserLandAssets(trans, addr, saveRes)
        if (!updateLandAssets) return new Error(PandaLandCodes.Update_Land_Assets_Fail)
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
        const updateIntegral = await transactionModel.updatePandaAttr(trans, 'integral', 30, geni)
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


// koaRouter.get('/testTrans', async (ctx) => {
//   const connection = await db.startTransaction()
//   if (!connection) return
//   connection.beginTransaction(function (err) {
//     if(err) return
//     async.series([
//       function (callback) {
//         var sql1 = "update user set upass=? where uaddr= ?"
//         var param1 = ['12345', '123']
//         connection.query(sql1, param1, function (qErr, rows, fields) {
//           if (qErr) {
//             connection.rollback(function () {
//               connection.release()
//             })
//           } else {
//             console.log('succRes')
//             callback(null)
//           }
//         })
//       },
//       function (callback) {
//         var sql1 = "update user set utradePass=? where uaddr= ?"
//         var param1 = ['12345', '123']
//         connection.query(sql1, param1, function (qErr, rows, fields) {
//           // if (qErr) {
//             connection.rollback(function () {
//               connection.release()
//             })
//           // } else {
//           //   callback(null)
//           // }
//         })
//       }
//     ], function (tErr, res) {
//       if (tErr) {
//         connection.rollback(function () {
//           console.log("transaction error: " + tErr)
//           connection.release()
//         })
//       } else {
//         connection.commit(function (err, info) {
//           if (err) {
//             connection.rollback(function (err) {
//               console.log("transaction error: " + err)
//               connection.release()
//             })
//           } else {
//             connection.release()
//           }
//         })
//       }
//     })
//   })
// })

module.exports = TransactionController