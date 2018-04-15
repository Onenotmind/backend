const Db = require('./Db.js')
const db = new Db()

const { PandaOwnerServerModel } = require('../sqlModel/pandaOwner.js')
const { pandaOwnerTestData } = require('../mysqlData/pandaOwner/sqlData.js')
/*
  pandaOwnerModel:
  - 测试操作:
    - 新建pandaOwner数据表 createPandaOwnerTable()
    - 删除pandaOwner数据表 dropPandaOwnerTable()
    - 插入测试数据 insertDataToPandaOwner()
  - 业务操作：
    - 查询所有熊猫 selectAllData()
    - 查询某个状态下的所有熊猫 queryPandasByState
    - 插入一只熊猫 genePanda()
    - 删除特定gen下的熊猫 delPandaByGen()
    - 更新某只熊猫的某个属性 updatePandaAttr()
    - 查询某个addr下的所有熊猫 queryAllPandaByAddr()
    - 查询某只熊猫的详细信息 queryPandaInfo()
    - 改变熊猫的oweraddr transferPandaOwner()
    - 查询某只熊猫外出回归带的物品 getPandaBackAssets()
    - 出售熊猫 sellPanda
    - 判断用户的交易密码是否正确 checkOwnerTradePwd
    - 将外出熊猫回归的状态更改为在家 pandaBackHome
*/

class PandaOwnerModel {

  async selectAllData () {
    let sql = 'SELECT * FROM pandaOwner'
    return db.query(sql)
  }

  async dropPandaOwnerTable () {
    let sql = 'DROP TABLE pandaOwner'
    return db.query(sql)
  }

  async createPandaOwnerTable () {
    let sql = 'CREATE TABLE pandaOwner('
    for(let index in PandaOwnerServerModel) {
       if (PandaOwnerServerModel.hasOwnProperty(index)) {
          let obj = PandaOwnerServerModel[index]
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

  async insertDataToPandaOwner () {
    let sql = 'INSERT INTO pandaOwner VALUES '
    for (let i = 0; i < pandaOwnerTestData.length; i++) {
      if (i !== pandaOwnerTestData.length - 1) {
        sql += pandaOwnerTestData[i] + ','
      } else {
        sql += pandaOwnerTestData[i]
      }
    }
    return db.query(sql)
  }

  async queryPandasByState (state) {
    let val = ['pandaowner', state]
    let sql = 'SELECT * FROM ?? WHERE state = ?'
    return db.query(sql, val)
  }

  async updatePandaAttr (attr, value, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET '+ attr +' = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async transferPandaOwner (addr, pandaGen) {
    let val = ['pandaowner', value, pandaGen]
    let sql = 'UPDATE ?? SET ownerAddr = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async genePanda (gen, addr, type, speed, hungry, gold, water, wood, fire, earth, special, integral, state, price) {
    let insertData = {
      pandaGen: gen,
      ownerAddr: addr,
      type: type,
      speed: speed,
      hungry: hungry,
      goldCatch: gold,
      woodCatch: wood,
      waterCatch:water,
      fireCatch:fire,
      earthCatch:earth,
      special:special,
      integral:integral,
      state: state,
      price: price
    }
    let sql = 'INSERT INTO pandaowner SET ?'
    return db.query(sql, insertData)
  }

  async queryPandaInfo (gen) {
  	let val = ['pandaowner', gen]
  	let sql = 'SELECT * FROM ?? WHERE pandaGen = ?'
  	return db.query(sql, val)
  }

  async queryAllPandaByAddr (addr) {
    let val = ['pandaowner', addr]
    let sql = 'SELECT * FROM ?? WHERE ownerAddr = ?'
    return db.query(sql, val)
  }

  async delPandaByGen (gen) {
    let val = ['pandaowner', gen]
    let sql = 'DELETE FROM ?? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async getPandaBackAssets (gen) {
    let val = ['backpandaassets', gen]
    let sql = 'SELECT * FROM ?? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async checkOwnerTradePwd (gen, tradePwd) {
    let val = ['pandaowner', gen, tradePwd]
    let sql = "select * from user inner join pandaowner on pandaowner.ownerAddr=user.uaddr " +
        "where pandaowner.pandaGen='0x12987u1vadahvbtyhvu3u89' AND user.utradePass='1234';"
    return db.query(sql)
  }

  async sellPanda (gen, price) {
    let val = ['pandaowner', price, gen]
    let sql = 'UPDATE ?? SET price = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }

  async pandaBackHome (gen) {
    let val = ['pandaowner', 'home', gen]
    let sql = 'UPDATE ?? SET state = ? WHERE pandaGen = ?'
    return db.query(sql, val)
  }
}

module.exports = PandaOwnerModel