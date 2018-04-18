const Db = require('./Db.js')
const db = new Db()

const { LandProductServerModel } = require('../sqlModel/landProduct.js')
const { landProductTestData } = require('../mysqlData/landProduct/sqlData.js')
/**
  LandProductModel:

    - 业务接口
      - 查询所有物品 selectAllData()
      - 插入物品 insertProduct()
      - 根据经纬度查询物品 findProductByGeo()
*/
class LandProductModel {

  /* 业务接口 */

  async selectAllData () {
    let sql = 'SELECT * FROM landProduct'
    return db.query(sql)
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
}

module.exports = LandProductModel