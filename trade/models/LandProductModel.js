const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')
const { UserServerModel, UserModelName } = require('../sqlModel/user.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')
const { LandProductServerModel, LandProductName } = require('../sqlModel/landProduct.js')
const { UserLandProductServerModel, UserLandProductName } = require('../sqlModel/userLandProduct.js')
const { landProductTestData } = require('../mysqlData/landProduct/sqlData.js')
const { UserProductManagerServerModel, UserProductManagerName } = require('../sqlModel/userProductManager.js')
/**
  @MYSQL landProduct:
    - 业务接口
      - 查询所有物品 selectAllData()
      - 增加待投票的商品 addVoteProduct
      - 对商品进行投票 voteProduct
      - 商品投票结束后售卖商品 sellProduct
      - 商品投票结束, 将prepare状态置为end endProductVote
      - 获得当前正在出售的商品 getCurrentProduct
      - 获得当前投票中的商品 getPrepareProduct
      - 获得当前过期的商品 getExpiredProduct
      - 商品下架 productDropOff
      - 删除商品 deleteProduct
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
    - 查询当前用户的竹子数量 queryUserBambooCount
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
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [LandProductServerModel.productId.label]: productId,
      [LandProductServerModel.type.label]: type,
      [LandProductServerModel.state.label]: 'prep',
      [LandProductServerModel.time.label]: 0,
      [LandProductServerModel.imgSrc.label]: imgSrc,
      [LandProductServerModel.name.label]: null,
      [LandProductServerModel.value.label]: null,
      [LandProductServerModel.recommender.label]: 'ETHLAND',
      [LandProductServerModel.gmt_create.label]: curTime,
      [LandProductServerModel.gmt_modified.label]:curTime
    }
    let val = [LandProductName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async voteProduct (productId, num) {
    let val = [
      LandProductName,
      LandProductServerModel.time.label,
      LandProductServerModel.time.label,
      num,
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'UPDATE ?? SET ?? = ?? + ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async sellProduct (productId, time) {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'sold',
      LandProductServerModel.time.label,
      time,
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getCurrentProduct () {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'sold'
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getPrepareProduct () {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'prep'
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getExpiredProduct () {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'end'
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async endProductVote () {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'end',
      LandProductServerModel.state.label,
      'prep'
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql)
  }

  async productDropOff (productId) {
    let val = [
      LandProductName,
      LandProductServerModel.state.label,
      'end',
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async deleteProduct (productId) {
    let val = [
      LandProductName,
      LandProductServerModel.productId.label,
      productId
    ]
    let sql = 'DELETE FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async queryLandProductByAddr (addr) {
    let val = [addr]
    let sql = 'SELECT u.value, u.idx_productId, l.imgSrc, l.name, l.nameEn ' +
      ' FROM userLandProduct u, landProduct l WHERE u.idx_addr = ? AND u.idx_productId = l.uk_productId'
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

  async insertLandProductToUser (userAddr, productId, value) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [UserLandProductServerModel.addr.label]: userAddr,
      [UserLandProductServerModel.productId.label]: productId,
      [UserLandProductServerModel.value.label]: value,
      [UserLandProductServerModel.gmt_create.label]: curTime,
      [UserLandProductServerModel.gmt_modified.label]: curTime
    }
    let val = [UserLandProductName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  async insertUserProduct (trans, userAddr, productId, userRealAddr, userPhone) {
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let insertData = {
      [UserProductManagerServerModel.addr.label]: userAddr,
      [UserProductManagerServerModel.productId.label]: productId,
      [UserProductManagerServerModel.userRealAddr.label]: userRealAddr,
      [UserProductManagerServerModel.userPhone.label]: userPhone,
      [UserProductManagerServerModel.userName.label]: '',
      [UserProductManagerServerModel.express.label]: '',
      [UserProductManagerServerModel.expressId.label]: '',
      [UserProductManagerServerModel.state.label]: 'ready',
      [UserProductManagerServerModel.gmt_create.label]: curTime,
      [UserProductManagerServerModel.gmt_modified.label]: curTime
    }
    let val = [UserProductManagerName, insertData]
    let sql = 'INSERT INTO ?? SET ?'
    return db.transQuery(trans, sql, val)
  }

  async deleteLandProductFrag (trans, userAddr, productId) {
    let val = [
      UserLandProductName,
      UserLandProductServerModel.value.label,
      UserLandProductServerModel.value.label,
      UserLandProductServerModel.productId.label,
      productId,
      UserLandProductServerModel.addr.label,
      userAddr
    ]
    let sql = 'UPDATE ?? SET ?? = ?? - 3 WHERE ?? = ? AND ?? = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateUserProductInfo (express, expressId, productId, addr) {
    let val = [
      UserProductManagerName,
      UserProductManagerServerModel.express.label,
      express,
      UserProductManagerServerModel.expressId.label,
      expressId,
      UserProductManagerServerModel.state.label,
      'send',
      UserProductManagerServerModel.productId.label,
      productId,
      UserProductManagerServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ?'
    return db.query(sql, val)
  }

  async updateUserBamboo (addr) {
    let val = [
      LandAssetsName,
      LandAssetsServerModel.bamboo.label,
      LandAssetsServerModel.bamboo.label,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ?? + 1 WHERE ?? = ?'
    return db.query(sql, val)
  }

  async queryUserEmail (addr){
    let val = [
      UserServerModel.email.label,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where ?? = ?'
    return db.query(sql, val)
  }

  async queryUserTradePwd (addr) {
    let val = [
      UserServerModel.pwd.label,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where uaddr = ?'
    return db.query(sql, val)
  }

  async queryUserBambooCount (addr) {
    let val = [
      LandAssetsServerModel.bamboo.label,
      LandAssetsName,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where ?? = ?'
    return db.query(sql, val)
  }
}

module.exports = LandProductModel