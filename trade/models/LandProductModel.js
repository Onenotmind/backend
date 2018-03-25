const Db = require('./Db.js')
const db = new Db()

const { LandProductServerModel } = require('../sqlModel/landProduct.js')

class LandProductModel {
	// 查询数据库中所有数据
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

  /**
  	@params:

  */
  async findProductByGeo (longitude, latitude, wid, height) {
  	let columns = [LandProductServerModel.longitude, LandProductServerModel.latitude, LandProductServerModel.type, LandProductServerModel.value]
    let val = [columns, 'landProduct', longitude + wid, latitude + height]
    let sql = ''
    // if (Math.abs(longitude) + width > 180 ){
    // 	sql = 'SELECT ?? FROM ?? WHERE ((? > 165 AND ? < 180 ) OR (? < -177)) AND (? >15);'
    // } else {

    // }
    sql = 'SELECT ?? FROM ?? WHERE ? < 180 AND ? < 90'
    return db.query(sql, val)
  }
}

module.exports = LandProductModel