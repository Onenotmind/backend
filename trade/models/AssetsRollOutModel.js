const Db = require('./Db.js')
const db = new Db()

const { assetsRollOut } = require('../sqlModel/assetsRollOut.js')

class AssetsRollOutModel {
	
	// 查询数据库中所有数据
  async queryAllRollOutAssets () {
    let sql = 'SELECT * FROM assetsRollOut'
    return db.query(sql)
  }

  // 查询指定订单号
  async queryAssetsRollOutById (orderId) {
    let val = ['assetsRollOut', orderId]
    let sql = 'SELECT * FROM ?? WHERE orderId = ?'
    return db.query(sql, val)
  }

  // 查询某一特定用户的转入资产
  queryRollOutAssetsByAddr (addr) {
    let val = ['assetsRollOut', addr]
    let sql = 'SELECT * FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  // 改变订单状态
  changeRollOutOrderState (orderId, state) {
    let val = ['assetsRollOut', state, orderId]
    let sql = 'UPDATE ?? SET ustate = ? WHERE orderId = ?'
    return db.query(sql, val)
  }
}

module.exports = AssetsRollOutModel