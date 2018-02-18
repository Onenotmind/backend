const Db = require('./Db.js')
const db = new Db()

const { AssetsServerModel } = require('../sqlModel/assets.js')

class AssetsModel {
	
	// 查询数据库中所有数据
  async queryAllAssets () {
    let sql = 'SELECT * FROM assets'
    return db.query(sql)
  }

  // 【资产确认】重置ETH资产
  async setEthAssets (count, id) {
  	let val = ['assets', count, id]
    console.log(val)
    let sql = 'UPDATE ?? SET ueth = ? WHERE uid = ?'
    return db.query(sql, val)
  }

  // 【资产确认】重置EOS资产
  async setEosAssets (count, id) {
  	let val = ['assets', count, id]
    console.log(val)
    let sql = 'UPDATE ?? SET ueos = ? WHERE uid = ?'
    return db.query(sql, val)
  }

  // 【资产Lock确认】重置ETH Lock资产
  async setEthLockAssets (count, id) {
  	let val = ['assets', count, id]
    let sql = 'UPDATE ?? SET uethLock = ? WHERE uid = ?'
    return db.query(sql, val)
  }

  // 【资产Lock确认】重置EOS Lock资产
  async setEosLockAssets (count, id) {
  	let val = ['assets', count, id]
    let sql = 'UPDATE ?? SET ueosLock = ? WHERE uid = ?'
    return db.query(sql, val)
  }

  // 查询指定用户资产
  async queryAssetsById (id) {
  	let columns = [AssetsServerModel.eth, AssetsServerModel.eos]
    let val = [columns, 'assets', id]
    let sql = 'SELECT ?? FROM ?? WHERE uid = ?'
    return db.query(sql, val)
  }
}

module.exports = AssetsModel