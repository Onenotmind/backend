const Db = require('./Db.js')
const db = new Db()

const { LandAssetsServerModel } = require('../sqlModel/landAssets.js')
const { landAssetsTestData } = require('../mysqlData/landAssets/sqlData.js')
/*
  landAssetsModel:
  - 测试操作:
    - 新建landAssets数据表 createLandAssetsTable()
    - 删除landAssets数据表 dropLandAssetsTable()
    - 插入测试数据 insertDataToLandAssets()
  - 业务操作：
    
*/
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

  async createLandAssetsTable () {
    let sql = 'CREATE TABLE landAssets('
    for(let index in LandAssetsServerModel) {
       if (LandAssetsServerModel.hasOwnProperty(index)) {
          let obj = LandAssetsServerModel[index]
          if (obj) {
            if (obj.label === 'other') {
              sql += obj.type
            } else {
              sql = sql + obj.label + ' ' + obj.type + ','
            }
          }
       }
    }
    return db.query(sql)
  }

  async dropLandAssetsTable () {
    let sql = 'DROP TABLE landAssets'
    return db.query(sql)
  }

  async insertDataToLandAssets () {
    let sql = 'INSERT INTO landAssets VALUES '
    for (let i = 0; i < landAssetsTestData.length; i++) {
      if (i !== landAssetsTestData.length - 1) {
        sql += landAssetsTestData[i] + ','
      } else {
        sql += landAssetsTestData[i]
      }
    }
    return db.query(sql)
  }
}

module.exports = LandAssetsModel