const Db = require('./Db.js')
const db = new Db()

const { PandaOwnerServerModel } = require('../sqlModel/pandaOwner.js')
const { pandaOwnerTestData } = require('../mysqlData/pandaOwner/sqlData.js')
/*
  pandaOwnerModel:
  - 业务操作：
    - 查询所有熊猫 selectAllData()
    - 查询某个状态下的所有熊猫 queryPandasByState
    - 查询某个地址的资产 queryAssetsByAddr
    - 插入一只熊猫 genePanda()
    - 删除特定gen下的熊猫 delPandaByGen()
    - 更新某只熊猫的某个属性 updatePandaAttr()
    - 查询某个addr下的所有熊猫 queryAllPandaByAddr()
    - 查询某只熊猫的详细信息 queryPandaInfo()
    - 改变熊猫的oweraddr transferPandaOwner()
    - 查询某只熊猫外出回归带的物品 getPandaBackAssets()
    - 出售熊猫 sellPanda
    - 判断用户的交易密码是否正确 checkOwnerTradePwd
    - 将外出熊猫回归的状态更改为在家 pandaBackHome
    - 批量插入landassets表 updateAssetsByAddr
    - 查询各个资产当前的净值 queryCurrentAssetsVal
    - 插入新的资产与价值 insertAssetsValue
    - 删除资产与其价值 delAssetsValue
  - 事务处理
    - 熊猫搜查商品时所需详细信息 getInfoForProduct
    - 根据经纬度查询物品 findProductByGeo
    - 更新熊猫属性 updatePandaAttrTrans
    - 更新熊猫的状态与价钱 updatePandaLocationStateTrans
    - 根据用户地址更新用户资产 updateLandAssetsByAddrTrans
    - 更新熊猫回去的资产 updateBackPandaAssetsTrans
    - 更新用户的ethland资产 updateUserLandAssetsTrans
    - 根据用户地址更新用户商品 updateLandProductByAddrTrans
    - 批量插入landassets表 updateAssetsByAddrTrans
  - @MYSQL UserLandProduct:
    - 插入一条商品记录 insertLandProductToUser
    - 更新商品记录 updateUserLandPro
    - 查询某个地址下某个商品的信息 querySpecifiedProByAddr
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
    let val = ['pandaowner', state]
    let sql = 'SELECT * FROM ?? WHERE state = ?'
    return db.query(sql, val)
  }

  async queryAssetsByAddr (addr) {
    let val = ['landAssets', addr]
    let sql = 'SELECT * FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  async updatePandaAttr (attr, value, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET '+ attr +' = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async transferPandaOwner (addr, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET ownerAddr = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async genePanda (gen, addr, type, speed, hungry, gold, water, wood, fire, earth, special, integral, state, price) {
    let insertData = {
      pandaGen: gen,
      ownerAddr: addr,
      type: type,
      speed: speed,
      hungry: hungry,
      goldCatch: gold,
      woodCatch: wood,
      waterCatch:water,
      fireCatch:fire,
      earthCatch:earth,
      special:special,
      integral:integral,
      state: state,
      price: price
    }
    let sql = 'INSERT INTO pandaowner SET ?'
    return db.query(sql, insertData)
  }

  async queryPandaInfo (gen) {
  	let val = ['pandaowner', gen]
  	let sql = 'SELECT * FROM ?? WHERE pandaGen = ?'
  	return db.query(sql, val)
  }

  async queryAllPandaByAddr (addr) {
    let val = ['pandaowner', addr]
    let sql = 'SELECT * FROM ?? WHERE ownerAddr = ?'
    return db.query(sql, val)
  }

  async delPandaByGen (gen) {
    let val = ['pandaowner', gen]
    let sql = 'DELETE FROM ?? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async getPandaBackAssets (gen) {
    let val = ['backpandaassets', gen]
    let sql = 'SELECT * FROM ?? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async checkOwnerTradePwd (gen, tradePwd) {
    let val = ['pandaowner', gen, tradePwd]
    let sql = "select * from user inner join pandaowner on pandaowner.ownerAddr=user.uaddr " +
        "where pandaowner.pandaGen='0x12987u1vadahvbtyhvu3u89' AND user.utradePass='1234';"
    return db.query(sql)
  }

  async sellPanda (gen, price) {
    let val = ['pandaowner', 'sold', price, gen]
    let sql = 'UPDATE ?? SET state = ? , price = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async pandaBackHome (gen) {
    let val = ['pandaowner', 'home', gen]
    let sql = 'UPDATE ?? SET state = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async updateAssetsByAddr (addr, buybamboo, ownerAddr, ownerbamboo) {
    let val = [addr, buybamboo, ownerAddr, ownerbamboo]
    let sql = 'update landassets set bamboo = case uaddr' +
      ' when ? then ? when ? then ? end'
    return db.query(sql, val)
  }

  async getInfoForProduct (trans, pandaGen) {
    let val = [pandaGen]
    let sql = '' +
    'select * from user '+
    'inner join pandaowner on pandaowner.ownerAddr=user.uaddr ' +
    ' inner join landassets l on user.uaddr=l.uaddr '+
    'where pandaowner.pandaGen="0x12987u1vadahvbtyhvu3u89";'
    console.log(sql)
    return db.transQuery(trans, sql)
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
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET '+ attr +' = ? WHERE pandaGen = ?'
    return db.transQuery(trans, sql, val)
  }

  async updatePandaLocationStateTrans (trans, state, price, pandaGen) {
    let val = ['pandaowner', state, price, pandaGen]
    let sql = 'UPDATE ?? SET state = ? , price = ? WHERE pandaGen = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateLandAssetsByAddrTrans (trans, addr, assetType, value) {
    let val = ['landassets', value, addr]
    let sql = 'UPDATE ?? SET '+ assetType +' = ? WHERE uaddr = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateBackPandaAssetsTrans (trans, pandaGen, carryAssets, dropAssets) {
    dropAssets = '1/WATER'
    let sql = 'INSERT INTO backpandaassets (pandaGen, backAssets,dropAssets) VALUES (' + pandaGen +
              ',' + carryAssets + ',' + dropAssets + 
              ') ON DUPLICATE KEY UPDATE backAssets=' + carryAssets +
              ', dropAssets=' + dropAssets
              console.log('sql..', sql)
    return db.transQuery(trans, sql)
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
    let addrSql = ' where uaddr=' + pandaowner
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
    let addrSql = ' where uaddr=' + pandaowner
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
    let val = ['assetsValue']
    let sql = 'SELECT * FROM ??'
    return db.query(sql, val)
  }

  async insertAssetsValue (productId, value) {
    let insertData = {
      productId: productId,
      value: value
    }
    let sql = 'INSERT INTO assetsValue SET ?'
    return db.query(sql, insertData)
  }

  async delAssetsValue (productId) {
    let val = ['assetsValue', productId]
    let sql = 'DELETE FROM ?? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async insertLandProductToUser (trans, userAddr, productId, value) {
    let insertData = {
      userAddr: userAddr,
      productId: productId,
      value: value
    }
    let sql = 'INSERT INTO userLandProduct SET ?'
    return db.transQuery(trans, sql, insertData)
  }

  async updateUserLandPro (trans, userAddr, productId, value) {
    let val = ['userlandproduct', value, userAddr, productId]
    let sql = 'UPDATE ?? SET value = value + ? WHERE userAddr = ? AND productId = ?'
    return db.transQuery(trans, sql, val)
  }

  async querySpecifiedProByAddr (addr, productId) {
    let val = [addr, productId]
    let sql = 'SELECT * FROM userLandProduct WHERE userAddr = ? AND productId = ?'
    return db.query(sql, val)
  }
}

module.exports = PandaOwnerModel