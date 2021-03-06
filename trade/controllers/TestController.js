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
				console.log('begin')
				const userExist = await testModel.checkUserTableExist()
				if (!userExist) return userExist
				if (userExist.length > 0) {
					const userDrop = await testModel.dropTableUser()
					if (!userDrop) return userDrop
				}
				const userCreate = await testModel.createTableUser()
				if (!userCreate) return userCreate
				const insertUser = await testModel.insertTestUserData()
				return insertUser
			},
			async function (res) {
				if (_.isError(res)) return res
				const assetsExist = await testModel.checkLandassetsTableExist()
				if (!assetsExist) return assetsExist
				if (assetsExist.length > 0) {
					const assetsDrop = await testModel.dropTableLandassets()
					if (!assetsDrop) return assetsDrop
				}
				const assetsCreate = await testModel.createTableLandassets()
				if (!assetsCreate) return assetsCreate
				const inserAssets = await testModel.insertTestLandAssetsData()
				return inserAssets
			},
			async function (res) {
				if (_.isError(res)) return res
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
		// @MYSQL LandProduct
			async function (res) {
				if (_.isError(res)) return res
				const productExist = await testModel.checkLandProductTableExist()
				if (!productExist) return productExist
				if (productExist.length > 0) {
					const productDrop = await testModel.dropLandProductTable()
					if (!productDrop) return productDrop
				}
				const productCreate = await testModel.createLandProductTable()
				if (!productCreate) return productCreate
				const inserProduct = await testModel.insertDataToLandProduct()
				return true
			},
			// @MYSQL UserLandProduct
			async function (res) {
				if (_.isError(res)) return res
				const productExist = await testModel.checkUserLandProductExist()
				if (!productExist) return productExist
				if (productExist.length > 0) {
					const productDrop = await testModel.dropUserLandProductTable()
					if (!productDrop) return productDrop
				}
				const productCreate = await testModel.createUserLandProductTable()
				return productCreate
			},
			// @MYSQL UserProductManager
			async function (res) {
				if (_.isError(res)) return res
				const productExist = await testModel.checkUserProductManager()
				if (!productExist) return productExist
				if (productExist.length > 0) {
					const productDrop = await testModel.dropUserProductManagerTable()
					if (!productDrop) return productDrop
				}
				const productCreate = await testModel.createUserProductManagerTable()
				return productCreate
			},
			// @MYSQL assetsvalue
			async function (res) {
				if (_.isError(res)) return res
				const productExist = await testModel.checkAssetsValue()
				if (!productExist) return productExist
				if (productExist.length > 0) {
					const productDrop = await testModel.dropAssetsValueTable()
					if (!productDrop) return productDrop
				}
				const productCreate = await testModel.createAssetsValueTable()
				return productCreate
			},
			// @MYSQL ethaddrmanager
			async function (res) {
				if (_.isError(res)) return res
				const ethaddrmanagerExist = await testModel.checkEthAddrManagerExist()
				if (!ethaddrmanagerExist) return ethaddrmanagerExist
				if (ethaddrmanagerExist.length > 0) {
					const ethaddrmanagerDrop = await testModel.dropEthAddrManagerTable()
					if (!ethaddrmanagerDrop) return ethaddrmanagerDrop
				}
				const ethaddrmanagerCreate = await testModel.createEthAddrManagerTable()
				return ethaddrmanagerCreate
			},
			// @MYSQL assetsrollin
			async function (res) {
				if (_.isError(res)) return res
				const tableExist = await testModel.checkAssetsRollInExist()
				if (!tableExist) return tableExist
				if (tableExist.length > 0) {
					const tableDrop = await testModel.dropAssetsRollInTable()
					if (!tableDrop) return tableDrop
				}
				const tableCreate = await testModel.createAssetsRollInTable()
				return tableCreate
			},
			// @MYSQL votelist
			async function (res) {
				if (_.isError(res)) return res
				const tableExist = await testModel.checkVoteListExist()
				if (!tableExist) return tableExist
				if (tableExist.length > 0) {
					const tableDrop = await testModel.dropVoteListTable()
					if (!tableDrop) return tableDrop
				}
				const tableCreate = await testModel.createVoteListTable()
				return tableCreate
			},
			// @MYSQL assetsrollout
			async function (res) {
				if (_.isError(res)) return res
				const tableExist = await testModel.checkAssetsRollOutExist()
				if (!tableExist) return tableExist
				if (tableExist.length > 0) {
					const tableDrop = await testModel.dropAssetsRollOutTable()
					if (!tableDrop) return tableDrop
				}
				const tableCreate = await testModel.createAssetsRollOutTable()
				return tableCreate
			},
			// @MYSQL backpandaassets
			async function (res) {
				if (_.isError(res)) return res
				const backpandaassetsExist = await testModel.checkBackPandaAssetsExist()
				if (!backpandaassetsExist) return backpandaassetsExist
				if (backpandaassetsExist.length > 0) {
					const backpandaassetsDrop = await testModel.dropBackPandaAssetsTable()
					if (!backpandaassetsDrop) return backpandaassetsDrop
				}
				const backpandaassetsCreate = await testModel.createBackPandaAssetsTable()
				return backpandaassetsCreate
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
		          	console.log('err', err)
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