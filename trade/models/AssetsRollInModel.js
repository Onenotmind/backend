const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')
const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { AssetsRollInName, AssetsRollInServerModel } = require('../sqlModel/assetsRollIn.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')

/**
 * @AssetsRollInModel
 *  - 查询数据库中提现订单 queryAllRollInAssets
 *  - 查询某一特定用户的提现订单 queryRollInAssetsByAddr
 *  - 查询指定订单号 queryAssetsRollInById
 *  - 更改订单状态 changeRollInOrderState
 *  - 新增一个充值订单 insertAssetsRollInOrder
 * @LandAssets
 *  - 增加某类资产 addUserLandAssets
 */

class AssetsRollInModel {
	
	// 查询数据库中所有数据
  async queryAllRollInAssets () {
    let sql = 'SELECT * FROM assetsRollIn'
    return db.query(sql)
  }

  // 新增一个充值订单
  async insertAssetsRollInOrder (type, amount, addr, userAddr) {
    let insertData = {
      [AssetsRollInServerModel.addr.label]: userAddr,
      [AssetsRollInServerModel.receiver.label]: addr,
      [AssetsRollInServerModel.type.label]: type,
      [AssetsRollInServerModel.amount.label]: parseFloat(amount).toFixed(4),
      [AssetsRollInServerModel.state.label]: 'pending', 
      [AssetsRollInServerModel.gmt_create.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      [AssetsRollInServerModel.gmt_modified.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    let val = [
      AssetsRollInName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }

  // 查询指定订单号
  async queryAssetsRollInById (orderId) {
    let val = [
      AssetsRollInName,
      AssetsRollInServerModel.id.label,
      orderId
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    const res = await db.query(sql, val)
    if (!res || res.length === 0) return new Error(CommonCodes.Service_Wrong)
    return res[0]
  }

  // 查询某一特定用户的转入资产
  queryRollInAssetsByAddr (addr) {
    let val = [
      AssetsRollInName,
      AssetsRollInServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT * FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }

  // 改变订单状态
  changeRollInOrderState (orderId, state) {
    let val = [
      AssetsRollInName,
      AssetsRollInServerModel.state.label,
      state,
      AssetsRollInServerModel.id.label,
      orderId
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
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

module.exports = AssetsRollInModel