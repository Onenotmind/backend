const Db = require('./Db.js')
const db = new Db()

const { UserServerModel } = require('../sqlModel/user.js')
const { LandAssetsServerModel } = require('../sqlModel/landAssets.js')

const { PandaOwnerServerModel } = require('../sqlModel/pandaOwner.js')
const { pandaOwnerTestData } = require('../mysqlData/pandaOwner/sqlData.js')

const { LandProductServerModel } = require('../sqlModel/landProduct.js')
const { landProductTestData } = require('../mysqlData/landProduct/sqlData.js')

const { UserLandProductServerModel } = require('../sqlModel/userLandProduct.js')

const { UserProductManagerServerModel } = require('../sqlModel/userProductManager.js')

const { AssetsValueServerModel } = require('../sqlModel/assetsValue.js')

const { BackPandaAssetsServerModel } = require('../sqlModel/backPandaAssets.js')

/**
	@TestModel 测试数据专用
		- user
	    - 判断user表是否存在 checkUserTableExist
	    - 新建user表 createTableUser
	    - 删除user表 dropTableUser
		- landassets
	    - 判断landassets表是否存在 checkLandassetsTableExist
	    - 新建landassets表 createTableLandassets
	    - 删除landassets表 dropTableLandassets
		- landproduct
	    - 新建LandProduct数据表 createLandProductTable()
	    - 删除LandProduct数据表 dropLandProductTable()
	    - 判断LandProduct表是否存在 checkLandProductTableExist
	    - 插入测试数据 insertDataToLandProduct()
    - UserLandProduct
      - 新建userLandProduct数据表 createUserLandProductTable()
      - 删除userLandProduct数据表 dropUserLandProductTable()
      - 判断userLandProduct表是否存在 checkUserLandProductExist
    - userProductManager
      - 新建userProductManager数据表 createUserProductManagerTable()
      - 删除userProductManager数据表 dropUserProductManagerTable()
      - 判断userProductManager表是否存在 checkUserProductManager
    - assetsValue
      - 新建assetsValue数据表 createAssetsValueTable()
      - 删除assetsValue数据表 dropAssetsValueTable()
      - 判断assetsValue表是否存在 checkAssetsValue
	  - pandaowner
	  	- 新建pandaOwner数据表 createPandaOwnerTable()
	    - 删除pandaOwner数据表 dropPandaOwnerTable()
	    - 插入测试数据 insertDataToPandaOwner()
	    - 判断pandaowner数据表是否存在  checkPandaownerTableExist
    - backpandaassets
      - 新建backpandaassets数据表 createBackPandaAssetsTable()
      - 删除BackPandaAssets数据表 dropBackPandaAssetsTable()
      - 判断BackPandaAssets数据表是否存在 checkBackPandaAssetsExist()

*/

class TestModel {

	async startTransaction () {
		return db.startTransaction()
	}

	/* user && landassets  */
	async checkUserTableExist () {
    let sql = 'show tables like "%user%"'
    return db.query(sql)
  }

  async checkLandassetsTableExist () {
    let sql = 'show tables like "%landassets%"'
    return db.query(sql)
  }

  async dropTableLandassets () {
    let sql = 'DROP TABLE landassets'
    return db.query(sql)
  }

  async dropTableUser () {
    let sql = 'DROP TABLE user'
    return db.query(sql)
  }

  async createTableUser () {
    let sql = 'CREATE TABLE user('
    for(let index in UserServerModel) {
       if (UserServerModel.hasOwnProperty(index)) {
          let obj = UserServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  async createTableLandassets () {
    let sql = 'CREATE TABLE landassets('
    for(let index in LandAssetsServerModel) {
       if (LandAssetsServerModel.hasOwnProperty(index)) {
          let obj = LandAssetsServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  /* landproduct  */
  async createLandProductTable () {
    let sql = 'CREATE TABLE landProduct('
    for(let index in LandProductServerModel) {
       if (LandProductServerModel.hasOwnProperty(index)) {
          let obj = LandProductServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropLandProductTable() {
    let sql = 'DROP TABLE landProduct'
    return db.query(sql)
  }

  async insertDataToLandProduct () {
    let sql = 'INSERT INTO landProduct VALUES '
    for (let i = 0; i < landProductTestData.length; i++) {
      if (i !== landProductTestData.length - 1) {
        sql += landProductTestData[i] + ','
      } else {
        sql += landProductTestData[i]
      }
    }
    return db.query(sql)
  }

  async checkLandProductTableExist () {
    let sql = 'show tables like "%landproduct%"'
    return db.query(sql)
  }

  /* userLandProduct */

  async checkUserLandProductExist () {
    let sql = 'show tables like "%userLandproduct%"'
    return db.query(sql)
  }

  async createUserLandProductTable () {
    let sql = 'CREATE TABLE userLandProduct('
    for(let index in UserLandProductServerModel) {
       if (UserLandProductServerModel.hasOwnProperty(index)) {
          let obj = UserLandProductServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropUserLandProductTable () {
    let sql = 'DROP TABLE userLandProduct'
    return db.query(sql)
  }

  /* userproductmanager */

  async createUserProductManagerTable () {
    let sql = 'CREATE TABLE userProductManager('
    for(let index in UserProductManagerServerModel) {
       if (UserProductManagerServerModel.hasOwnProperty(index)) {
          let obj = UserProductManagerServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropUserProductManagerTable () {
    let sql = 'DROP TABLE userProductManager'
    return db.query(sql)
  }

  async checkUserProductManager () {
    let sql = 'show tables like "%userProductManager%"'
    return db.query(sql)
  }

  /* assetsvalue */
  async createAssetsValueTable () {
    let sql = 'CREATE TABLE assetsvalue('
    for(let index in AssetsValueServerModel) {
       if (AssetsValueServerModel.hasOwnProperty(index)) {
          let obj = AssetsValueServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropAssetsValueTable () {
    let sql = 'DROP TABLE assetsvalue'
    return db.query(sql)
  }

  async checkAssetsValue () {
    let sql = 'show tables like "%assetsvalue%"'
    return db.query(sql)
  }

  /* pandaowner */
  async dropPandaOwnerTable () {
    let sql = 'DROP TABLE pandaOwner'
    return db.query(sql)
  }

  async checkPandaownerTableExist () {
    let sql = 'show tables like "%pandaOwner%"'
    return db.query(sql)
  }

  async createPandaOwnerTable () {
    let sql = 'CREATE TABLE pandaOwner('
    for(let index in PandaOwnerServerModel) {
       if (PandaOwnerServerModel.hasOwnProperty(index)) {
          let obj = PandaOwnerServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  async insertDataToPandaOwner () {
    let sql = 'INSERT INTO pandaOwner VALUES '
    for (let i = 0; i < pandaOwnerTestData.length; i++) {
      if (i !== pandaOwnerTestData.length - 1) {
        sql += pandaOwnerTestData[i] + ','
      } else {
        sql += pandaOwnerTestData[i]
      }
    }
    return db.query(sql)
  }

  async createBackPandaAssetsTable () {
    let sql = 'CREATE TABLE backpandaassets('
    for(let index in BackPandaAssetsServerModel) {
       if (BackPandaAssetsServerModel.hasOwnProperty(index)) {
          let obj = BackPandaAssetsServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropBackPandaAssetsTable () {
    let sql = 'DROP TABLE backpandaassets'
    return db.query(sql)
  }

  async checkBackPandaAssetsExist () {
    let sql = 'show tables like "%backpandaassets%"'
    return db.query(sql)
  }
}

module.exports = TestModel