const Db = require('./Db.js')
const db = new Db()

const { UserServerModel } = require('../sqlModel/user.js')

class LoginModel {
  // 查询数据库中所有数据
  async selectAllData () {
    let sql = 'SELECT * FROM user'
    return db.query(sql)
  }

  // 查询指定email的用户信息
  async queryUserByEmail (email) {
    let columns = [UserServerModel.id, UserServerModel.email, UserServerModel.state]
    let val = [columns, 'user', email]
    let sql = 'SELECT ?? FROM ?? WHERE uemail = ?'
    return db.query(sql, val)
  }

  // 查询指定addr的用户信息
  async queryUserByAdde (addr) {
    let columns = [UserServerModel.id, UserServerModel.email, UserServerModel.state]
    let val = [columns, 'user', addr]
    let sql = 'SELECT ?? FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  // 插入注册用户数据
  async insertUser (email, pwd) {
    let insertData = {
      uemail: email,
      upwd: pwd,
      utradePwd: '',
      ustate: 'registed',
      uaddr: '',
      longitude: '',
      latitude: ''
    }
    let sql = 'INSERT INTO user SET ?'
    return db.query(sql, insertData)
  }

  async insertUserByAddr (addr, longtitude, latitude) {
    let insertData = {
      uemail:'',
      upass: '',
      utradePass: '',
      ustate: 'registed',
      uaddr: addr,
      longitude: longtitude,
      latitude: latitude
    }
    console.log(insertData)
    let sql = 'INSERT INTO user SET ?'
    return db.query(sql, insertData)
  }

  // 账号密码登陆
  async userLogin (email, pwd) {
    let columns = [UserServerModel.id, UserServerModel.email, UserServerModel.pwd, UserServerModel.tradePwd, UserServerModel.state]
    let val = [columns, 'user', email, pwd]
    let sql = 'SELECT ?? FROM ?? WHERE uemail= ? && upwd= ?'
    return db.query(sql, val)
  }

  // 更改用户密码
  async changeLoginPwd (email, newPwd) {
    let val = ['user', newPwd, email]
    let sql = 'UPDATE ?? SET upwd = ? WHERE uemail = ?'
    return db.query(sql, val)
  }

  // 更改用户交易密码
  async changeTradePwd (email, newPwd) {
    let val = ['user', newPwd, email]
    let sql = 'UPDATE ?? SET utradePwd = ? WHERE uemail = ?'
    return db.query(sql, val)
  }

  /**
    用户状态更改
      - 用户注册
      - 用户认证
      - 用户注销
  */
  async updateUserState (email, newState) {
    let val = ['user', newState, email]
    let sql = 'UPDATE ?? SET ustate = ? WHERE uemail = ?'
    return db.query(sql, val)
  }

  // 通过用户addr查询用户经纬度
  async getUserInfoByAddr (addr) {
    let columns = [UserServerModel.longitude, UserServerModel.latitude]
    let val = [columns, 'user', addr]
    let sql = 'SELECT ?? FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }
}

module.exports = LoginModel
