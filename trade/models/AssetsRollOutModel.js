const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')

const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { LandAssetsName, LandAssetsServerModel } = require('../sqlModel/landAssets.js')
const { AssetsRollOutName, AssetsRollOutServerModel } = require('../sqlModel/assetsRollOut.js')
const { UserServerModel, UserModelName } = require('../sqlModel/user.js')

/**
 * @AssetsRollOutModel
 *  - 查询数据库中提现订单 queryAllRollOutAssets
 *  - 查询指定订单号 queryAssetsRollOutById
 *  - 查询某一特定用户的提现订单 queryRollOutAssetsByAddr
 *  - 更改订单状态 changeRollOutOrderState
 *  - 新增一个提现订单 insertAssetsRollOutOrder
 * @landassets
 *  - 查询指定地址下的资产 queryLandAssetsByAddr
 *  - 提现资产 rollOutAssets
 * @user
 *  - 查询用户的交易密码 queryUserTradePwd
 */

class AssetsRollOutModel {
	
	// 查询数据库中所有数据
  async queryAllRollOutAssets () {
    let sql = 'SELECT * FROM assetsRollOut'
    return db.query(sql)
  }

  // 新增一个提现订单
  async insertAssetsRollOutOrder (addr, receiver, type, amount) {
    let insertData = {
      [AssetsRollOutServerModel.addr.label]: addr,
      [AssetsRollOutServerModel.receiver.label]: receiver,
      [AssetsRollOutServerModel.type.label]: type,
      [AssetsRollOutServerModel.amount.label]: parseFloat(amount).toFixed(4),
      [AssetsRollOutServerModel.state.label]: 'pending', 
      [AssetsRollOutServerModel.gmt_create.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      [AssetsRollOutServerModel.gmt_modified.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    let val = [
      AssetsRollOutName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  // 查询指定订单号
  async queryAssetsRollOutById (orderId) {
    let val = [
      AssetsRollOutName,
      AssetsRollOutServerModel.id.label,
      orderId
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    const res = await db.query(sql, val)
    if (!res || res.length === 0) return new Error(CommonCodes.Service_Wrong)
    return res[0]
  }

  // 查询某一特定用户的转入资产
  queryRollOutAssetsByAddr (addr) {
    let val = [
      AssetsRollOutName,
      AssetsRollOutServerModel.addr.label,
      addr
    ]
    console.log(val)
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  // 改变订单状态
  changeRollOutOrderState (orderId, state) {
    let val = [
      AssetsRollOutName,
      AssetsRollOutServerModel.state.label,
      state,
      AssetsRollOutServerModel.id.label,
      orderId
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  // 查询指定地址下的资产
  queryLandAssetsByAddr (addr) {
    let val = [
      LandAssetsName,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  /**
   * 提现资产
   * @params way 'out' 提现 'back' 提现失败
   */
  rollOutAssets (type, amount, addr, way) {
    const count = parseFloat(amount).toFixed(3)
    let assetsType = null
    let assetsTypeLock = null
    if (type === 'eth') {
      assetsType = LandAssetsServerModel.eth.label
      assetsTypeLock = LandAssetsServerModel.ethLock.label     
    } else if (type === 'eos') {
      assetsType = LandAssetsServerModel.eos.label
      assetsTypeLock = LandAssetsServerModel.eosLock.label   
    } else {
      return
    }
    let val = [
      LandAssetsName,
      assetsType,
      assetsType,
      count,
      assetsTypeLock,
      assetsTypeLock,
      count,
      LandAssetsServerModel.addr.label,
      addr
    ]
    console.log('val', val)
    let sql = ''
    if (way === 'out') {
      sql = 'update ?? set ?? = ?? - ?, ?? = ?? +? WHERE ?? = ?'
    } else if (way === 'back') {
      sql = 'update ?? set ?? = ?? + ?, ?? = ?? -? WHERE ?? = ?'
    } else {}
    return db.query(sql, val)
  }

  async queryUserTradePwd (addr) {
    let val = [
      UserServerModel.tradePwd.label,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where ?? = ?'
    return db.query(sql, val)
  }

  /**
   * 更改某类资产
   * @params way 增加'add'  减少'minus'
   * @params type 'eos' 'eosLock' 'eth' 'ethLock'
   */
  changeUserLandAssets (type, amount, addr, way) {
    const count = parseFloat(amount).toFixed(3)
    let assetsType = null
    if (type === 'eth') {
      assetsType = LandAssetsServerModel.eth.label   
    } else if (type === 'eos') {
      assetsType = LandAssetsServerModel.eos.label  
    } else if (type === 'ethLock') {
      assetsType = LandAssetsServerModel.ethLock.label    
    } else if (type === 'eosLock') {
      assetsType = LandAssetsServerModel.eosLock.label 
    } else {
      return
    }
    let val = [
      LandAssetsName,
      assetsType,
      assetsType,
      count,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = ''
    if (way === 'add') {
      sql = 'update ?? set  ?? = ?? + ? WHERE ?? = ?'
    } else if (way === 'minus') {
      sql = 'update ?? set  ?? = ?? - ? WHERE ?? = ?'
    } else {}
    return db.query(sql, val)
  }
}

module.exports = AssetsRollOutModel