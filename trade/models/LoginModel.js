const Db = require('./Db.js')
const db = new Db()

const { UserServerModel } = require('../sqlModel/user.js')
/*
  table: user
  colume:
    - uid 用户id
    - uemail 用户注册邮箱
    - upwd 用户登陆密码
    - utradePwd 用户交易密码
    - ustate 用户状态
*/

class LoginModel {
  // 查询数据库中所有数据
  async selectAllData () {
    let sql = 'SELECT * FROM user'
    return db.query(sql)
  }

  // 查询指定email的用户信息
  async queryUserByEmail (email) {
    let columns = [UserServerModel.uid, UserServerModel.uemail, UserServerModel.ustate]
    let val = [columns, 'user', email]
    let sql = 'SELECT ?? FROM ?? WHERE uemail = ?'
    return db.query(sql, val)
  }

  // 插入注册用户数据
  async insertUser (email, pwd) {
    let insertData = {
      uemail: email,
      upwd: pwd,
      utradePwd: '',
      ustate: 'registed'
    }
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
}

module.exports = LoginModel
