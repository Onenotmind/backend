const Db = require('./Db.js')
const db = new Db()

// const PandaOwnerModel = require('./pandaOwnerModel.js')
// const pandaOwnerModel = new PandaOwnerModel()
// const LoginModel = require('./LoginModel.js')
// const loginModel = new LoginModel()
// const LandAssetsModel = require('./LandAssetsModel.js')
// const landAssetsModel = new LandAssetsModel()
// const LandProductModel = require('./LandProductModel.js')
// const landProductModel = new LandProductModel()

/**
	@TransactionModel 事务model
	- getInfoForProduct 熊猫搜查商品时所需详细信息
	- findProductByGeo 根据经纬度查询物品
	- updatePandaAttr 更新熊猫属性
  - updatePandaLocationState 更新熊猫的状态与价钱
	- updateLandAssetsByAddr 根据用户地址更新用户资产
  - updateBackPandaAssets 更新熊猫回去的资产
  - updateUserLandAssets 更新用户的ethland资产
  - queryPandaInfo 查询熊猫详细信息
  - queryAssetsByAddr 查询某个地址的资产
  - updateAssetsByAddr 批量插入landassets表
*/

class TransactionModel {

	async startTransaction () {
		return db.startTransaction()
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

  async updatePandaAttr (trans, attr, value, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET '+ attr +' = ? WHERE pandaGen = ?'
    return db.transQuery(trans, sql, val)
  }

  async updatePandaLocationState (trans, state, price, pandaGen) {
    let val = ['pandaowner', state, price, pandaGen]
    let sql = 'UPDATE ?? SET state = ? , price = ? WHERE pandaGen = ?'
    return db.transQuery(trans, sql, val)
  }

  async updateLandAssetsByAddr (trans, addr, assetType, value) {
  	let val = ['landassets', value, addr]
    let sql = 'UPDATE ?? SET '+ assetType +' = ? WHERE uaddr = ?'
    return db.transQuery(trans, sql, val)
  }

  async testQuery() {
  	return db.testQuery()
  }

  async updateBackPandaAssets (trans, pandaGen, carryAssets, dropAssets) {
    dropAssets = '1/WATER'
    let sql = 'INSERT INTO backpandaassets (pandaGen, backAssets,dropAssets) VALUES (' + pandaGen +
              ',' + carryAssets + ',' + dropAssets + 
              ') ON DUPLICATE KEY UPDATE backAssets=' + carryAssets +
              ', dropAssets=' + dropAssets
              console.log('sql..', sql)
    return db.transQuery(trans, sql)
  }

  async updateUserLandAssets (trans, pandaowner, assetsArr) {
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

  async queryPandaInfo (pandaGen) {
    let val = [ pandaGen]
    let sql = 'SELECT * FROM pandaowner inner join landassets l on l.uaddr=pandaowner.ownerAddr WHERE pandaowner.pandaGen= ?'
    return db.query(sql, val)
  }

  async queryAssetsByAddr (addr) {
    let val = ['landAssets', addr]
    let sql = 'SELECT * FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  async updateAssetsByAddr (addr, buybamboo, ownerAddr, ownerbamboo) {
    let val = [addr, buybamboo, ownerAddr, ownerbamboo]
    let sql = 'update landassets set bamboo = case uaddr' +
      ' when ? then ? when ? then ? end'
    return db.query(sql, val)
  }
}

module.exports = TransactionModel