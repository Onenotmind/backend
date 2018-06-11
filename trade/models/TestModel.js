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

const { BackPandaAssetsServerModel, BackPandaAssetsName } = require('../sqlModel/backPandaAssets.js')

const { EthAddrManagerName, EthAddrManagerServerModel } = require('../sqlModel/ethAddrManager.js')


/**
	@TestModel 测试数据专用
		- user
	    - 判断user表是否存在 checkUserTableExist
	    - 新建user表 createTableUser
	    - 删除user表 dropTableUser
      - 插入测试数据 insertTestUserData
		- landassets
	    - 判断landassets表是否存在 checkLandassetsTableExist
	    - 新建landassets表 createTableLandassets
	    - 删除landassets表 dropTableLandassets
      - 插入测试数据 insertTestLandAssetsData
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
      - 插入panda owner数据表 genePanda()
	    - 判断pandaowner数据表是否存在  checkPandaownerTableExist
    - backpandaassets
      - 新建backpandaassets数据表 createBackPandaAssetsTable()
      - 删除BackPandaAssets数据表 dropBackPandaAssetsTable()
      - 判断BackPandaAssets数据表是否存在 checkBackPandaAssetsExist()
    - ethAddrManager
      - 新建ethAddrManager数据表 createEthAddrManagerTable()
      - 删除ethAddrManager数据表 dropEthAddrManagerTable()
      - 判断ethAddrManager数据表是否存在 checkEthAddrManagerExist()
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

  async insertTestUserData () {
    let insertData = {
      [UserServerModel.addr.label]: 'ethland',
      [UserServerModel.email.label]: '',
      [UserServerModel.pwd.label]: 'ethland',
      [UserServerModel.phone.label]: null,
      [UserServerModel.tradePwd.label]: '',
      [UserServerModel.state.label]: 'reg',
      [UserServerModel.longitude.label]: 0,
      [UserServerModel.latitude.label]: 0,
      [UserServerModel.gmt_create.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      [UserServerModel.gmt_modified.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    let val = [
      UserModelName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async createTableUser () {
    let sql = this.getTableCreateSql(UserModelName, UserServerModel)
    return db.query(sql)
  }

  async insertTestLandAssetsData () {
    let insertData = {
      [LandAssetsServerModel.addr.label]: 'ethland',
      [LandAssetsServerModel.bamboo.label]: 2000,
      [LandAssetsServerModel.bambooLock.label]: 0,
      [LandAssetsServerModel.eth.label]: 0,
      [LandAssetsServerModel.ethLock.label]: 0,
      [LandAssetsServerModel.eos.label]: 0,
      [LandAssetsServerModel.eosLock.label]: 0
    }
    let val = [
      LandAssetsName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val) 
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
    let sql = 'DROP TABLE landproduct'
    return db.query(sql)
  }

  async insertDataToLandProduct () {
    let insertCb = async (productId, type, productType, state, imgSrc, name, nameEn, value, productSrc) => {
      let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      let timer = new Date().getTime()
      let insertData = {
        [LandProductServerModel.productId.label]: productId,
        [LandProductServerModel.type.label]: type,
        [LandProductServerModel.productType.label]: productType,
        [LandProductServerModel.state.label]: state,
        [LandProductServerModel.time.label]: timer,
        [LandProductServerModel.imgSrc.label]: imgSrc,
        [LandProductServerModel.name.label]: name,
        [LandProductServerModel.nameEn.label]: nameEn,
        [LandProductServerModel.value.label]: value,
        [LandProductServerModel.productSrc.label]: productSrc,
        [LandProductServerModel.recommender.label]: 'ETHLAND',
        [LandProductServerModel.gmt_create.label]: curTime,
        [LandProductServerModel.gmt_modified.label]:curTime
      }
      let val = [LandProductName, insertData]
      let sql = 'INSERT INTO ?? SET ?'
      await db.query(sql, val)
    }

    for (let pro of LandProductInserData) {
      await insertCb(pro.productId, pro.type, pro.productType, pro.state, pro.imgSrc, pro.name, pro.nameEn, pro.value, pro.productSrc)
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
    let sql = 'show tables like "userlandproduct"'
    return db.query(sql)
  }

  async createUserLandProductTable () {
    let sql = this.getTableCreateSql(UserLandProductName, UserLandProductServerModel)
    return db.query(sql)
  }

  async dropUserLandProductTable () {
    let sql = 'DROP TABLE userlandproduct'
    return db.query(sql)
  }

  /* userproductmanager */

  async createUserProductManagerTable () {
    let sql = this.getTableCreateSql(UserProductManagerName, UserProductManagerServerModel)
    return db.query(sql)
  }

  async dropUserProductManagerTable () {
    let sql = 'DROP TABLE userproductmanager'
    return db.query(sql)
  }

  async checkUserProductManager () {
    let sql = 'show tables like "userproductmanager"'
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
    let sql = 'DROP TABLE pandaowner'
    return db.query(sql)
  }

  async checkPandaownerTableExist () {
    let sql = 'show tables like "pandaowner"'
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
    for (let panda of pandaOwnerTestData) {
      await this.genePanda(...panda)
    }
    return true
  }

  async genePanda (gen, addr, type, speed, hungry, gold, water, wood, fire, earth, special, integral, state, price) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [PandaOwnerServerModel.gen.label]: gen,
      [PandaOwnerServerModel.addr.label]: addr,
      [PandaOwnerServerModel.type.label]: type,
      [PandaOwnerServerModel.speed.label]: speed,
      [PandaOwnerServerModel.hungry.label]: hungry,
      [PandaOwnerServerModel.goldCatch.label]: gold,
      [PandaOwnerServerModel.woodCatch.label]: wood,
      [PandaOwnerServerModel.waterCatch.label]:water,
      [PandaOwnerServerModel.fireCatch.label]:fire,
      [PandaOwnerServerModel.earthCatch.label]:earth,
      [PandaOwnerServerModel.special.label]:special,
      [PandaOwnerServerModel.integral.label]:integral,
      [PandaOwnerServerModel.state.label]: state,
      [PandaOwnerServerModel.price.label]: price,
      [PandaOwnerServerModel.gmt_create.label]: curTime,
      [PandaOwnerServerModel.gmt_modified.label]:curTime
    }
    let val = [PandaOwnerName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async createBackPandaAssetsTable () {
    let sql = this.getTableCreateSql(BackPandaAssetsName, BackPandaAssetsServerModel)
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

  async checkEthAddrManagerExist () {
    let sql = 'show tables like "ethaddrmanager"'
    return db.query(sql)
  }

  async dropEthAddrManagerTable () {
    let sql = 'DROP TABLE ethaddrmanager'
    return db.query(sql)
  }

  async createEthAddrManagerTable () {
    let sql = this.getTableCreateSql(EthAddrManagerName, EthAddrManagerServerModel)
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