const Db = require('./Db.js')
const db = new Db()

const { assetsRollIn } = require('../sqlModel/assetsRollIn.js')

class AssetsRollInModel {
	
	// 查询数据库中所有数据
  async queryAllRollInAssets () {
    let sql = 'SELECT * FROM assetsRollIn'
    return db.query(sql)
  }

  // 查询指定订单号
  async queryAssetsRollInById (orderId) {
    let val = ['assetsRollIn', orderId]
    let sql = 'SELECT * FROM ?? WHERE orderId = ?'
    return db.query(sql, val)
  }

  // 查询某一特定用户的转入资产
  queryRollInAssetsByAddr (addr) {
    let val = ['assetsRollIn', addr]
    let sql = 'SELECT * FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  // 转入订单确认
  checkOverRollInOrder (orderId, state) {
    let val = ['assetsRollIn', state, orderId]
    console.log(val)
    let sql = 'UPDATE ?? SET ustate = ? WHERE orderId = ?'
    return db.query(sql, val)
  }
}

module.exports = AssetsRollInModel