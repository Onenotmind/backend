const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')
const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { UserServerModel, UserModelName } = require('../sqlModel/user.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')
const { LandProductServerModel, LandProductName } = require('../sqlModel/landProduct.js')
const { UserLandProductServerModel, UserLandProductName } = require('../sqlModel/userLandProduct.js')
const { PandaOwnerServerModel, PandaOwnerName } = require('../sqlModel/pandaOwner.js')
const { BackPandaAssetsName, BackPandaAssetsServerModel } = require('../sqlModel/backPandaAssets.js')
const { AssetsValueName, AssetsValueServerModel } = require('../sqlModel/assetsValue.js')
const { pandaOwnerTestData } = require('../mysqlData/pandaOwner/sqlData.js')
/*
  @MYSQL pandaOwner
  - 业务操作：
    - 查询所有熊猫 selectAllData()
    - 查询某个状态下的所有熊猫 queryPandasByState
    - 插入一只熊猫 genePanda()
    - 删除特定gen下的熊猫 delPandaByGen()
    - 更新某只熊猫的某个属性 updatePandaAttr()
    - 查询某个addr下的的所有熊猫 queryTotalPandaByAddr
    - 查询某个addr下的没有出售的所有熊猫 queryAllPandaByAddr()
    - 查询某个addr下所有外出熊猫 queryAllOutPandaByAddr
    - 查询某只熊猫的详细信息 queryPandaInfo()
    - 改变熊猫的oweraddr transferPandaOwner()
    - 出售熊猫 sellPanda
    - 取消出售熊猫 unSoldPanda
    - 判断用户的交易密码是否正确 checkOwnerTradePwd
    - 将外出熊猫回归的状态更改为在家 pandaBackHome
  - 事务处理
    - 更新熊猫属性 updatePandaAttrTrans
    - 更新熊猫的状态与价钱 updatePandaLocationStateTrans
    - 更新熊猫的（金木水火土）属性 updatePandaAttribute
    - 将外出熊猫回归的状态更改为在家 pandaBackHomeTrans
  - @MYSQL UserLandProduct:
    - 插入一条商品记录 insertLandProductToUser
    - 更新商品记录 updateUserLandPro
    - 查询某个地址下某个商品的信息 querySpecifiedProByAddr
  - @MYSQL backPandaAssets
    - 查询某只熊猫外出回归带的物品 getPandaBackAssets()
    - 更新熊猫回去的资产 updateBackPandaAssetsTrans
    - 查询某个addr下所有回归的商品 getPandaBackAssetsByAddr
    - 查询backpandaassets是否还有特定熊猫的资产 queryBackPandaAssetsByGen
    - 删除backpandaassets特定熊猫的资产 deleteBackPandaAssetsByGen
  - @MYSQL landproduct
    - 查询某个商品的信息 queryLandProductInfo
    - 获取当前land所有商品 findAllproduct
    - 根据用户地址更新用户商品 updateLandProductByAddrTrans TODO
    - 根据经纬度查询物品 findProductByGeo TODO
    - 剩余商品数量减一 minusProductCount
  - @MYSQL landassets
    - 查询某个地址的资产 queryAssetsByAddr
    - 批量插入landassets表 updateAssetsByAddr
    - 批量插入landassets表 updateAssetsByAddrTrans TODO 
    - 根据用户地址更新用户资产 updateLandAssetsByAddrTrans
    - 更新用户的ethland资产 updateUserLandAssetsTrans TODO
  - @MYSQL assetsValue
    - 查询各个资产当前的净值 queryCurrentAssetsVal
    - 插入新的资产与价值 insertAssetsValue
    - 删除资产与其价值 delAssetsValue
  - @MYSQL user landassets pandaowner
    - 熊猫搜查商品时所需详细信息 getInfoForProduct
    - 获取用户的state状态 getUserRegisterState
    - 获取熊猫对应的addr getAddrByPandaGen
*/

class PandaOwnerModel {

  async startTransaction () {
    return db.startTransaction()
  }

  async selectAllData () {
    let sql = 'SELECT * FROM pandaOwner'
    return db.query(sql)
  }

  async queryPandasByState (state) {
    let columns = [
      PandaOwnerServerModel.addr.label,
      PandaOwnerServerModel.gen.label,
      PandaOwnerServerModel.type.label,
      PandaOwnerServerModel.speed.label,
      PandaOwnerServerModel.hungry.label,
      PandaOwnerServerModel.goldCatch.label,
      PandaOwnerServerModel.waterCatch.label,
      PandaOwnerServerModel.fireCatch.label,
      PandaOwnerServerModel.earthCatch.label,
      PandaOwnerServerModel.woodCatch.label,
      PandaOwnerServerModel.special.label,
      PandaOwnerServerModel.integral.label,
      PandaOwnerServerModel.price.label,
      PandaOwnerServerModel.state.label
    ]
    let val = [
      columns,
      PandaOwnerName,
      PandaOwnerServerModel.state.label,
      state
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async queryAssetsByAddr (addr) {
    let columns = [
      LandAssetsServerModel.bamboo.label,
      LandAssetsServerModel.bambooLock.label,
      LandAssetsServerModel.eth.label,
      LandAssetsServerModel.ethLock.label,
      LandAssetsServerModel.eos.label,
      LandAssetsServerModel.eosLock.label,
    ]
    let val = [
      columns,
      LandAssetsName,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async updatePandaAttr (attr, value, pandaGen) {
    let val = [
      PandaOwnerName,
      attr,
      value,
      PandaOwnerServerModel.gen.label,
      pandaGen
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async transferPandaOwner (trans, addr, pandaGen) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.addr.label,
      addr,
      PandaOwnerServerModel.state.label,
      'home',
      PandaOwnerServerModel.gen.label,
      pandaGen
    ]
    let sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?'
    return db.transQuery(trans, sql, val)
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

  async queryPandaInfo (gen) {
    let columns = [
      PandaOwnerServerModel.addr.label,
      PandaOwnerServerModel.type.label,
      PandaOwnerServerModel.speed.label,
      PandaOwnerServerModel.hungry.label,
      PandaOwnerServerModel.goldCatch.label,
      PandaOwnerServerModel.waterCatch.label,
      PandaOwnerServerModel.fireCatch.label,
      PandaOwnerServerModel.earthCatch.label,
      PandaOwnerServerModel.woodCatch.label,
      PandaOwnerServerModel.special.label,
      PandaOwnerServerModel.integral.label,
      PandaOwnerServerModel.price.label,
      PandaOwnerServerModel.state.label
    ]
    let val = [
      columns,
      PandaOwnerName,
      PandaOwnerServerModel.gen.label,
      gen
    ]
  	let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
  	return db.query(sql, val)
  }

  async queryTotalPandaByAddr (addr) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async queryAllPandaByAddr (addr) {
    let columns = [
      PandaOwnerServerModel.gen.label,
      PandaOwnerServerModel.type.label,
      PandaOwnerServerModel.speed.label,
      PandaOwnerServerModel.hungry.label,
      PandaOwnerServerModel.goldCatch.label,
      PandaOwnerServerModel.waterCatch.label,
      PandaOwnerServerModel.fireCatch.label,
      PandaOwnerServerModel.earthCatch.label,
      PandaOwnerServerModel.woodCatch.label,
      PandaOwnerServerModel.special.label,
      PandaOwnerServerModel.integral.label,
      PandaOwnerServerModel.state.label
    ]
    let val = [
      columns,
      PandaOwnerName,
      PandaOwnerServerModel.addr.label,
      addr,
      PandaOwnerServerModel.state.label,
      'sold'
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? != ?'
    return db.query(sql, val)
  }

  async queryAllOutPandaByAddr (addr) {
    let columns = [
      PandaOwnerServerModel.gen.label,
      PandaOwnerServerModel.type.label,
      PandaOwnerServerModel.speed.label,
      PandaOwnerServerModel.hungry.label,
      PandaOwnerServerModel.goldCatch.label,
      PandaOwnerServerModel.waterCatch.label,
      PandaOwnerServerModel.fireCatch.label,
      PandaOwnerServerModel.earthCatch.label,
      PandaOwnerServerModel.woodCatch.label,
      PandaOwnerServerModel.special.label,
      PandaOwnerServerModel.integral.label,
      PandaOwnerServerModel.price.label
    ]
    let val = [
      columns,
      PandaOwnerName,
      PandaOwnerServerModel.addr.label,
      addr,
      PandaOwnerServerModel.state.label,
      'out'
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?'
    return db.query(sql, val)
  } 

  async delPandaByGen (gen) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.gen.label,
      gen
    ]
    let sql = 'DELETE FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getPandaBackAssets (gen) {
    let columns = [
      BackPandaAssetsServerModel.backAssets.label,
      BackPandaAssetsServerModel.dropAssets.label
    ]
    let val = [
      columns,
      BackPandaAssetsName,
      BackPandaAssetsServerModel.gen.label,
      gen
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getPandaBackAssetsByAddr (addr) {
    let val = [
      BackPandaAssetsServerModel.backAssets.label,
      BackPandaAssetsName,
      BackPandaAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async checkOwnerTradePwd (gen, tradePwd) {
    let val = [gen, tradePwd]
    let sql = "select * from user inner join pandaowner on pandaowner.idx_addr=user.uk_addr " +
        "where pandaowner.uk_gen=? AND user.utradePass=?"
    return db.query(sql, val)
  }

  async sellPanda (gen, price) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.state.label,
      'sold',
      PandaOwnerServerModel.price.label,
      price,
      PandaOwnerServerModel.gen.label,
      gen
    ]
    let sql = 'UPDATE ?? SET ?? = ? , ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async unSoldPanda (gen) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.state.label,
      'home',
      PandaOwnerServerModel.gen.label,
      gen
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async pandaBackHome (gen) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.state.label,
      'home',
      PandaOwnerServerModel.gen.label,
      gen
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async updateAssetsByAddr (trans, addr, buybamboo) {
    let val = [
      LandAssetsName,
      LandAssetsServerModel.bamboo.label,
      buybamboo,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'update ?? set ?? = ? where ?? = ?'
    return db.transQuery(trans, sql, val)
  }

  async getInfoForProduct (pandaGen, trans) {
    let val = [pandaGen]
    let sql = 'select * from user '+
    'inner join pandaowner on pandaowner.idx_addr=user.uk_addr ' +
    ' inner join landassets l on user.uk_addr=l.uk_addr '+
    'where pandaowner.uk_gen= ?'
    return db.query(sql, val)
  }

  async getAddrByPandaGen (gen) {
    const info = await this.getInfoForProduct(gen)
    if (!info || info.length === 0) return new Error(CommonCodes.Service_Wrong)
    return info[0][UserServerModel.addr.label]
  }

  async getUserRegisterState (addr) {
    let val = [
      UserServerModel.state.label,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where ?? = ?'
    const res = await db.query(sql, val)
    if (!res || res.length === 0) return new Error(CommonCodes.Service_Wrong)
    if (res[0][UserServerModel.state.label] === 'auth') {
      return true
    } else {
      return false
    }
  }

  async findProductByGeo (trans, longitude, latitude, wid, height) {
    let val = []
    let sql = ''
    if (longitude + wid > 180) {
      let caclLong = 360 - longitude - wid
      let caclLati = latitude - height < -90 ? -90: latitude - height
      val = ['landProduct', parseFloat(longitude), parseFloat(caclLong), parseFloat(latitude), parseFloat(caclLati)]
    } else{
      let caclLong = longitude + wid
      let caclLati = latitude - height < -90 ? -90: latitude - height
      val = ['landProduct', parseFloat(longitude), parseFloat(caclLong), parseFloat(latitude), parseFloat(caclLati)]
    }
    console.log('geoPro', val)
    sql = 'SELECT * FROM ?? WHERE ((longitude > ?) OR(longitude < ?)) AND((latitude < ?) OR(latitude > ?))'
    return db.transQuery(trans, sql, val)
  }

  async updatePandaAttrTrans (trans, attr, value, pandaGen) {
    let val = [
      PandaOwnerName,
      attr,
      value,
      PandaOwnerServerModel.gen.label,
      pandaGen
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.transQuery(trans, sql, val)
  }

  /**
   * attrArr
   * speed, hungry, gold, wood, water, fire, earth, intergral
   */
  async updatePandaAttribute (attrArr, gen, trans) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.speed.label,
      PandaOwnerServerModel.speed.label,
      attrArr[0],
      PandaOwnerServerModel.hungry.label,
      PandaOwnerServerModel.hungry.label,
      attrArr[1],
      PandaOwnerServerModel.goldCatch.label,
      PandaOwnerServerModel.goldCatch.label,
      attrArr[2],
      PandaOwnerServerModel.woodCatch.label,
      PandaOwnerServerModel.woodCatch.label,
      attrArr[3],
      PandaOwnerServerModel.waterCatch.label,
      PandaOwnerServerModel.waterCatch.label,
      attrArr[4],
      PandaOwnerServerModel.fireCatch.label,
      PandaOwnerServerModel.fireCatch.label,
      attrArr[5],
      PandaOwnerServerModel.earthCatch.label,
      PandaOwnerServerModel.earthCatch.label,
      attrArr[6],
      PandaOwnerServerModel.integral.label,
      PandaOwnerServerModel.integral.label,
      attrArr[7],
      PandaOwnerServerModel.gen.label,
      gen
    ]
    let sql = 'UPDATE ?? SET ?? = ?? + ?, ?? = ?? + ?, ?? = ?? + ?, ?? = ?? +?, ?? = ??+?, ?? = ??+?, ?? = ??+?, ?? = ??+? WHERE ?? = ?'
    if (trans) {
      return db.transQuery(trans, sql, val)
    } else {
      return db.query(sql, val)
    }
  }

  async updatePandaLocationStateTrans (trans, state, price, pandaGen) {
    let val = [
      PandaOwnerName,
      PandaOwnerServerModel.state.label,
      state,
      PandaOwnerServerModel.price.label,
      price,
      PandaOwnerServerModel.gen.label,
      pandaGen
    ]
    let sql = 'UPDATE ?? SET ?? = ? , ?? = ? WHERE ?? = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateLandAssetsByAddrTrans (trans, addr, assetType, value) {
    let val = [
      LandAssetsName,
      assetType,
      value,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    if (trans) {
      return db.transQuery(trans, sql, val)
    } else {
      return db.query(sql, val)
    }
  }

  async updateBackPandaAssetsTrans (trans, addr, pandaGen, carryAssets, dropAssets) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [BackPandaAssetsServerModel.addr.label]: addr,
      [BackPandaAssetsServerModel.gen.label]: pandaGen,
      [BackPandaAssetsServerModel.backAssets.label]: carryAssets,
      [BackPandaAssetsServerModel.dropAssets.label]: dropAssets,
      [BackPandaAssetsServerModel.gmt_create.label]: curTime,
      [BackPandaAssetsServerModel.gmt_modified.label]:curTime
    }
    console.log(insertData)
    let val = [BackPandaAssetsName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.transQuery(trans, sql, val)
  }

  async queryBackPandaAssetsByGen (pandaGen) {
    let columns = [
      BackPandaAssetsServerModel.backAssets.label,
      BackPandaAssetsServerModel.dropAssets.label
    ]
    let val = [
      columns,
      BackPandaAssetsName,
      BackPandaAssetsServerModel.gen.label,
      pandaGen
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async deleteBackPandaAssetsByGen (pandaGen, trans) {
    let val = [
      BackPandaAssetsName,
      BackPandaAssetsServerModel.gen.label,
      pandaGen
    ]
    let sql = 'DELETE FROM ?? WHERE ?? = ?'
    if (trans) {
      return db.transQuery(trans, sql, val)
    } else {
      return db.query(sql, val)
    }
  }

  async updateUserLandAssetsTrans (trans, pandaowner, assetsArr) {
    let sql = 'UPDATE landassets SET '
    for (let i = 0; i < assetsArr.length; i++) {
      let type = assetsArr[i].split('/')[1].toLowerCase()
      let val = parseFloat(assetsArr[i].split('/')[0])
      let insertSql = ''
      if (assetsArr.length -1 === i) {
        insertSql = type + '=' + type + '+'+ val
      } else {
        insertSql = type + '=' + type + '+' + val + ','
      }
      sql += insertSql
    }
    let addrSql = ' where uk_addr=' + pandaowner
    sql += addrSql
    return db.transQuery(trans, sql)
  }

  async updateLandProductByAddrTrans (trans, pandaowner, assetsArr) {
    let sql = 'UPDATE userlandproduct SET '
    for (let i = 0; i < assetsArr.length; i++) {
      let type = assetsArr[i].split('/')[1].toLowerCase()
      let val = parseFloat(assetsArr[i].split('/')[0])
      let insertSql = ''
      if (assetsArr.length -1 === i) {
        insertSql = type + '=' + type + '+'+ val
      } else {
        insertSql = type + '=' + type + '+' + val + ','
      }
      sql += insertSql
    }
    let addrSql = ' where idx_addr=' + pandaowner
    sql += addrSql
    return db.transQuery(trans, sql)
  }

  async updateAssetsByAddrTrans (addr, buybamboo, ownerAddr, ownerbamboo) {
    let val = [addr, buybamboo, ownerAddr, ownerbamboo]
    let sql = 'update landassets set bamboo = case uaddr' +
      ' when ? then ? when ? then ? end'
    return db.query(sql, val)
  }

  // @MYSQL assetsValue
  async queryCurrentAssetsVal () {
    let val = [AssetsValueName]
    let sql = 'SELECT * FROM ??'
    return db.query(sql, val)
  }

  async insertAssetsValue (productId, value) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [AssetsValueServerModel.productId.label]: productId,
      [AssetsValueServerModel.value.label]: value,
      [AssetsValueServerModel.gmt_create.label]: curTime,
      [AssetsValueServerModel.gmt_modified.label]:curTime
    }
    let val = [AssetsValueName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async delAssetsValue (productId) {
    let val = [
      AssetsValueName,
      AssetsValueServerModel.productId.label,
      productId
    ]
    let sql = 'DELETE FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async insertLandProductToUser (userAddr, productId) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [UserLandProductServerModel.addr.label]: userAddr,
      [UserLandProductServerModel.productId.label]: productId,
      [UserLandProductServerModel.value.label]: 1,
      [UserLandProductServerModel.gmt_create.label]: curTime,
      [UserLandProductServerModel.gmt_modified.label]:curTime
    }
    let val = [UserLandProductName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async updateUserLandPro (userAddr, productId) {
    let val = [
      UserLandProductName,
      UserLandProductServerModel.value.label,
      UserLandProductServerModel.value.label,
      UserLandProductServerModel.addr.label,
      userAddr,
      UserLandProductServerModel.productId.label,
      productId
    ]
    let sql = 'UPDATE ?? SET ?? = ?? + 1 WHERE ?? = ? AND ?? = ?'
    return db.query(sql, val)
  }

  async querySpecifiedProByAddr (addr, productId) {
    let val = [
      UserLandProductName,
      UserLandProductServerModel.addr.label,
      addr,
      UserLandProductServerModel.productId.label,
      productId
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ? AND ?? = ?'
    return db.query(sql, val)
  }

  async findAllproduct () {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'sold'
    ]
    let sql = 'SELECT * FROM ?? where ?? = ?'
    return db.query(sql, val)
  }

  async minusProductCount (productId) {
    const val = [
      LandProductName,
      LandProductServerModel.leftCount.label,
      LandProductServerModel.leftCount.label,
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'update ?? set ?? = ?? - 1 where ?? = ?'
    return db.query(sql, val)
  }

  async queryLandProductInfo (productId) {
    const columns = [
      LandProductServerModel.imgSrc.label,
      LandProductServerModel.leftCount.label,
      LandProductServerModel.type.label
    ]
    let val = [
      columns,
      LandProductName,
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }
}

module.exports = PandaOwnerModel