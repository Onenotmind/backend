const Db = require('./Db.js')
const db = new Db()

const { LandProductServerModel } = require('../sqlModel/landProduct.js')
const { landProductTestData } = require('../mysqlData/landProduct/sqlData.js')
/**
  @MYSQL landProduct:
    - 业务接口
      - 查询所有物品 selectAllData()
      - 插入物品 insertProduct()
      - 增加待投票的商品 addVoteProduct
      - 对商品进行投票 voteProduct
      - 商品投票结束后售卖商品 sellProduct
      - 商品投票结束, 将prepare状态置为end endProductVote
      - 获得当前正在出售的商品 getCurrentProduct
      - 获得当前投票中的商品 getPrepareProduct
      - 获得当前过期的商品 getExpiredProduct
      - 商品下架 productDropOff
      - 删除商品 deleteProduct
      - 根据经纬度查询物品 findProductByGeo()
  @MYSQL UserLandProduct:
    - 业务接口
      - 查询某个地址下所有商品 queryLandProductByAddr
      - 查询某个地址下某个商品的信息 querySpecifiedProByAddr
      - 插入一条商品记录 insertLandProductToUser
      - 删除用户的商品碎片 deleteLandProductFrag
  @MYSQL UserProductManager
    - 业务接口
      - 插入一条商品兑换成功数据 insertUserProduct
      - 更新当前物流信息 updateUserProductInfo
  @MYSQL landassets
    - 业务接口
      - 更新用户的竹子数量 updateUserBamboo
  @MYSQL user
    - 查询用户的邮箱 queryUserEmail
    - 查询用户的交易密码 queryUserTradePwd
*/
class LandProductModel {

  /* 业务接口 */

  async startTransaction () {
    return db.startTransaction()
  }

  async selectAllData () {
    let sql = 'SELECT * FROM landProduct'
    return db.query(sql)
  }

  async addVoteProduct (productId, type, imgSrc) {
    let insertData = {
      productId: productId,
      type: type,
      state: 'prepare',
      time: 0,
      imgSrc: imgSrc
    }
    let sql = 'INSERT INTO landProduct SET ?'
    return db.query(sql, insertData)
  }

  async voteProduct (productId, num) {
    let val = [num, productId]
    let sql = 'UPDATE landProduct SET time = time + ? WHERE productId = ?'
    return db.query(sql, val)
  }

  async sellProduct (productId, time) {
    let val = ['sold', time, productId]
    let sql = 'UPDATE landProduct SET state = ?, time = ? WHERE productId = ?'
    return db.query(sql, val)
  }

  async getCurrentProduct () {
    let val = ['sold']
    let sql = 'SELECT * FROM landProduct WHERE state = ?'
    return db.query(sql, val)
  }

  async getPrepareProduct () {
    let val = ['prepare']
    let sql = 'SELECT * FROM landProduct WHERE state = ?'
    return db.query(sql, val)
  }

  async getExpiredProduct () {
    let val = ['end']
    let sql = 'SELECT * FROM landProduct WHERE state = ?'
    return db.query(sql, val)
  }

  async endProductVote () {
    let val = ['end', 'prepare']
    let sql = 'UPDATE landProduct SET state = ? WHERE state = ?'
    return db.query(sql)
  }

  async productDropOff (productId) {
    let val = ['end', productId]
    let sql = 'UPDATE landProduct SET state = ? WHERE productId = ?'
    return db.query(sql, val)
  }

  async deleteProduct (productId) {
    let val = [productId]
    let sql = 'DELETE FROM landProduct WHERE productId = ?'
    return db.query(sql, val)
  }

  async insertProduct (longitude, latitude, type, value) {
  	let insertData = {
      longitude: longitude,
      latitude: latitude,
      type: type,
      value: value
    }
    let sql = 'INSERT INTO landProduct SET ?'
    return db.query(sql, insertData)
  }

  async findProductByGeo (longitude, latitude, wid, height) {
  	let columns = [LandProductServerModel.longitude, LandProductServerModel.latitude, LandProductServerModel.type, LandProductServerModel.value]
    let val = []
    let sql = ''
    if (longitude + wid > 180) {
      let caclLong = 360 - longitude - wid
      let caclLati = latitude - height < -90 ? -90: latitude - height
      val = [columns, 'landProduct', longitude, caclLong, latitude, caclLati]
    } else{
      let caclLong = longitude + wid
      let caclLati = latitude - height < -90 ? -90: latitude - height
      val = [columns, 'landProduct', longitude, caclLong, latitude, caclLati]
    }
    sql = 'SELECT ?? FROM ?? WHERE ((longitude > ?) OR(longitude < ?)) AND((latitude < ?) OR(latitude > ?))'
    return db.query(sql, val)
  }

  async queryLandProductByAddr (addr) {
    let val = [addr]
    let sql = 'SELECT u.value, u.productId, l.imgSrc, l.name ' +
      ' FROM userLandProduct u, landProduct l WHERE u.userAddr = ? AND u.productId = l.productId'
    return db.query(sql, val)
  }

  async querySpecifiedProByAddr (addr, productId) {
    let val = [addr, productId]
    let sql = 'SELECT * FROM userLandProduct WHERE userAddr = ? AND productId = ?'
    return db.query(sql, val)
  }

  async insertLandProductToUser (userAddr, productId, value) {
    let insertData = {
      userAddr: userAddr,
      productId: productId,
      value: value
    }
    let sql = 'INSERT INTO userLandProduct SET ?'
    return db.query(sql, insertData)
  }

  async insertUserProduct (trans, userAddr, productId, userRealAddr, userPhone) {
    let insertData = {
      userAddr: userAddr,
      productId: productId,
      userRealAddr: userRealAddr,
      userPhone: userPhone,
      express: '',
      expressId: '',
      state: 'ready'
    }
    let sql = 'INSERT INTO userProductManager SET ?'
    return db.transQuery(trans, sql, insertData)
  }

  async deleteLandProductFrag (trans, userAddr, productId) {
    let val = [productId, userAddr]
    let sql = 'UPDATE userLandProduct SET value = value - 3 WHERE productId = ? AND userAddr = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateUserProductInfo (express, expressId) {
    let val = [express, expressId, 'send']
    let sql = 'UPDATE UserProductManager SET express = ?, expressId = ?, state = ? WHERE productId = ?'
    return db.query(sql, val)
  }

  async updateUserBamboo (addr) {
    let val = ['landassets', count, addr]
    let sql = 'UPDATE ?? SET bamboo = bamboo + 1 WHERE uaddr = ?'
    return db.query(sql, val)
  }

  async queryUserEmail (addr){
    let val = ['uemail', 'user', addr]
    let sql = 'select ?? from ?? where uaddr = ?'
    return db.query(sql, val)
  }

  async queryUserTradePwd (addr) {
    let val = ['utradePwd', 'user', addr]
    let sql = 'select ?? from ?? where uaddr = ?'
    return db.query(sql, val)
  }
}

module.exports = LandProductModel