const _ = require('lodash')
const async = require('async')
const TestModel = require('../models/TestModel.js')
const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const testModel = new TestModel()

class TestController {
	async createTestTable (ctx) {
		const trans = await testModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		let tasks = [
			async function () {
				const userExist = await testModel.checkUserTableExist()
				if (!userExist) return userExist
				if (userExist.length > 0) {
					const userDrop = await testModel.dropTableUser()
					if (!userDrop) return userDrop
				}
				const userCreate = await testModel.createTableUser()
				if (!userCreate) return userCreate
			},
			async function (res) {
				if (!_.isError(res)) return res
				const assetsExist = await testModel.checkLandassetsTableExist()
				if (!assetsExist) return assetsExist
				if (assetsExist.length > 0) {
					const assetsDrop = await testModel.dropTableLandassets()
					if (!assetsDrop) return assetsDrop
				}
				const assetsCreate = await testModel.createTableLandassets()
				if (!assetsCreate) return assetsCreate
			},
			async function (res) {
				if (!_.isError(res)) return res
				const pandaownerExist = await testModel.checkPandaownerTableExist()
				if (!pandaownerExist) return pandaownerExist
				if (pandaownerExist.length > 0) {
					const pandaownerDrop = await testModel.dropPandaOwnerTable()
					if (!pandaownerDrop) return pandaownerDrop
				}
				const pandaownerCreate = await testModel.createPandaOwnerTable()
				if (!pandaownerCreate) return pandaownerCreate
				const pandaInsert = await testModel.insertDataToPandaOwner()
				if (!pandaInsert) return pandaInsert
			},
			async function (res) {
				if (!_.isError(res)) return res
				const productExist = await testModel.checkLandProductTableExist()
				if (!productExist) return productExist
				if (productExist.length > 0) {
					const productDrop = await testModel.dropLandProductTable()
					if (!productDrop) return productDrop
				}
				const productCreate = await testModel.createLandProductTable()
				if (!productCreate) return productCreate
				const productInsert = await testModel.insertDataToLandProduct()
				if (!productInsert) return productInsert
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
} 

module.exports = TestController