const Db = require('./Db.js')
const db = new Db()

const { PandaOwnerServerModel } = require('../sqlModel/pandaOwner.js')

class PandaOwnerModel {
	// 查询数据库中所有数据
  async selectAllData () {
    let sql = 'SELECT * FROM pandaOwner'
    return db.query(sql)
  }

  // 增加熊猫对某种属性的探测属性
  async updatePandaAttr (attr, value, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET '+ attr +' = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  // 产生一只的熊猫
  genePandaRandom (gen, addr, type, speed, hungry, gold, water, wood, fire, earth, special, integral) {
    let insertData = {
      pandaGen: gen,
      owenrAddr: addr,
      type: type,
      speed: speed,
      hungry: hungry,
      goldCatch: gold,
      woodCatch: wood,
      waterCatch:water,
      fireCatch:fire,
      earthCatch:earth,
      special:special,
      integral:integral
    }
    let sql = 'INSERT INTO pandaowner SET ?'
    return db.query(sql, insertData)
  }

  async queryPandaInfo (gen) {
  	let val = ['pandaowner', gen]
  	let sql = 'SELECT * FROM ?? WHERE pandaGen = ?'
  	return db.query(sql, val)
  }
}

module.exports = PandaOwnerModel