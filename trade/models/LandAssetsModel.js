const Db = require('./Db.js')
const db = new Db()

const { LandAssetsServerModel } = require('../sqlModel/landAssets.js')

class LandAssetsModel {
	// 查询数据库中所有数据
  async selectAllData () {
    let sql = 'SELECT * FROM landAssets'
    return db.query(sql)
  }

  // 查询某个地址的资产
  async queryAssetsByAddr (addr) {
  	let val = ['landAssets', addr]
  	let sql = 'SELECT * FROM ?? WHERE uaddr = ?'
  	return db.query(sql, val)
  }
}

module.exports = LandAssetsModel