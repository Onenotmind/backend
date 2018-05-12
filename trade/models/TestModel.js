const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')

const { UserServerModel, UserModelName } = require('../sqlModel/user.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')

const { PandaOwnerServerModel, PandaOwnerName } = require('../sqlModel/pandaOwner.js')
const { pandaOwnerTestData } = require('../mysqlData/pandaOwner/sqlData.js')

const { LandProductServerModel, LandProductName, LandProductInserData } = require('../sqlModel/landProduct.js')
const { landProductTestData } = require('../mysqlData/landProduct/sqlData.js')

const { UserLandProductServerModel, UserLandProductName } = require('../sqlModel/userLandProduct.js')

const { UserProductManagerServerModel, UserProductManagerName } = require('../sqlModel/userProductManager.js')

const { AssetsValueServerModel, AssetsValueName } = require('../sqlModel/assetsValue.js')

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
  - 辅助函数
    - 检测字段是否是索引 checkColumnsIsIndex
    - 根据 model 层返回创建数据表的sql语句 getTableCreateSql

*/

class TestModel {

	async startTransaction () {
		return db.startTransaction()
	}

	/* user && landassets  */
	async checkUserTableExist () {
    let sql = 'show tables like "user"'
    return db.query(sql)
  }

  async checkLandassetsTableExist () {
    let sql = 'show tables like "landassets"'
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
    let sql = this.getTableCreateSql(UserModelName, UserServerModel)
    return db.query(sql)
  }

  async createTableLandassets () {
    let sql = this.getTableCreateSql(LandAssetsName, LandAssetsServerModel)
    return db.query(sql)
  }

  /* landproduct  */
  async createLandProductTable () {
    let sql = this.getTableCreateSql(LandProductName, LandProductServerModel)
    return db.query(sql)
  }

  async dropLandProductTable() {
    let sql = 'DROP TABLE landProduct'
    return db.query(sql)
  }

  async insertDataToLandProduct () {
    let insertCb = async (productId, imgSrc, name) => {
      let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      let timer = new Date().getTime()
      let insertData = {
        [LandProductServerModel.productId.label]: productId,
        [LandProductServerModel.type.label]: 'fire',
        [LandProductServerModel.state.label]: 'sold',
        [LandProductServerModel.time.label]: timer,
        [LandProductServerModel.imgSrc.label]: imgSrc,
        [LandProductServerModel.name.label]: name,
        [LandProductServerModel.value.label]: 100,
        [LandProductServerModel.recommender.label]: 'ETHLAND',
        [LandProductServerModel.gmt_create.label]: curTime,
        [LandProductServerModel.gmt_modified.label]:curTime
      }
      let val = [LandProductName, insertData]
      let sql = 'INSERT INTO ?? SET ?'
      await db.query(sql, val)
    }

    for (let pro of LandProductInserData) {
      await insertCb(pro.productId, pro.imgSrc, pro.name)
    }
    // let sql = 'INSERT INTO landProduct VALUES '
    // for (let i = 0; i < landProductTestData.length; i++) {
    //   if (i !== landProductTestData.length - 1) {
    //     sql += landProductTestData[i] + ','
    //   } else {
    //     sql += landProductTestData[i]
    //   }
    // }
    // return db.query(sql)
    // return true
  }

  async checkLandProductTableExist () {
    let sql = 'show tables like "landproduct"'
    return db.query(sql)
  }

  /* userLandProduct */

  async checkUserLandProductExist () {
    let sql = 'show tables like "userLandproduct"'
    return db.query(sql)
  }

  async createUserLandProductTable () {
    let sql = this.getTableCreateSql(UserLandProductName, UserLandProductServerModel)
    return db.query(sql)
  }

  async dropUserLandProductTable () {
    let sql = 'DROP TABLE userLandProduct'
    return db.query(sql)
  }

  /* userproductmanager */

  async createUserProductManagerTable () {
    let sql = this.getTableCreateSql(UserProductManagerName, UserProductManagerServerModel)
    return db.query(sql)
  }

  async dropUserProductManagerTable () {
    let sql = 'DROP TABLE userProductManager'
    return db.query(sql)
  }

  async checkUserProductManager () {
    let sql = 'show tables like "userProductManager"'
    return db.query(sql)
  }

  /* assetsvalue */
  async createAssetsValueTable () {
    let sql = this.getTableCreateSql(AssetsValueName, AssetsValueServerModel)
    return db.query(sql)
  }

  async dropAssetsValueTable () {
    let sql = 'DROP TABLE assetsvalue'
    return db.query(sql)
  }

  async checkAssetsValue () {
    let sql = 'show tables like "assetsvalue"'
    return db.query(sql)
  }

  /* pandaowner */
  async dropPandaOwnerTable () {
    let sql = 'DROP TABLE pandaOwner'
    return db.query(sql)
  }

  async checkPandaownerTableExist () {
    let sql = 'show tables like "pandaOwner"'
    return db.query(sql)
  }

  async createPandaOwnerTable () {
    let sql = this.getTableCreateSql(PandaOwnerName, PandaOwnerServerModel)
    return db.query(sql)
  }

  async insertDataToPandaOwner () {
    // let sql = 'INSERT INTO pandaOwner VALUES '
    // for (let i = 0; i < pandaOwnerTestData.length; i++) {
    //   if (i !== pandaOwnerTestData.length - 1) {
    //     sql += pandaOwnerTestData[i] + ','
    //   } else {
    //     sql += pandaOwnerTestData[i]
    //   }
    // }
    // return db.query(sql)
    return true
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
    let sql = 'show tables like "backpandaassets"'
    return db.query(sql)
  }

  /**
    * 检测字段是否是索引 checkColumnsIsIndex
    * @params { string } col 字段名
    */
  checkColumnsIsIndex (col) {
    if (col.indexOf('pk_') < 0 && col.indexOf('uk_') < 0 && col.indexOf('idx_') < 0 && col.indexOf('other')) {
      return false
    } else {
      return true
    }
  }

  /**
    * 根据 model 层返回创建数据表的sql语句 getTableCreateSql
    * @params { string } name 数据表名
    * @params { object } serverModel 数据表字段结构
    */
  getTableCreateSql (name, serverModel) {
    let sql = 'create table '+ name + '('
    for(let index in serverModel) {
       if (serverModel.hasOwnProperty(index)) {
          let obj = serverModel[index]
          if (obj) {
            // 判断是否是索引或者是其他
            if (this.checkColumnsIsIndex(index)) {
              sql += obj.label
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return sql
  }
}

module.exports = TestModel