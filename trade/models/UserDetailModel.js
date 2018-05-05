const Db = require('./Db.js')
const db = new Db()

const { UserServerModel } = require('../sqlModel/user.js')
const { LandAssetsServerModel } = require('../sqlModel/landAssets.js')

/**
	@UserDetailModel (mysql_table @user @landassets)
    - 业务操作
  		- 查询指定addr的用户信息 queryUserByAddr
      - 查询用户的邮箱 queryUserEmail
  		- 用户注册,只需要地址与密码即可 userRegister
      - 用户资产初始化 createUserAsset
  		- 账号密码登陆 userLogin
      - 绑定邮箱 bindEmail
  		- 更改用户密码 changeLoginPwd
  		- 更改用户交易密码 changeTradePwd
  		- 通过用户addr查询用户经纬度 getUserLocationByAddr
*/

class UserDetailModel {
	async userRegister (addr, pwd, tradePwd, email, longitude, latitude) {
		let insertData = {
      uemail: email || '',
      upwd: pwd,
      utradePwd: '',
      ustate: 'registed',
      uaddr: addr,
      longitude: longitude,
      latitude: latitude
    }
    let sql = 'INSERT INTO user SET ?'
    return db.query(sql, insertData)
	}

  async createUserAsset (addr) {
    let insertData = {
      uaddr: addr,
      bamboo: 0,
      bambooLock: 0,
      eth: 0,
      ethLock: 0,
      eos: 0,
      eosLock: 0
    }
    let sql = 'INSERT INTO landassets SET ?'
    return db.query(sql, insertData) 
  }

	async userLogin (addr, pwd) {
		let val = ['user', addr, pwd]
    let sql = 'SELECT * FROM ?? WHERE uaddr= ? && upwd= ?'
    return db.query(sql, val)
  }

  async queryUserByAddr (addr) {
  	let val = ['user', addr]
  	let sql = 'select * from ?? inner join landassets l on user.uaddr=l.uaddr where user.uaddr = ?'
  	return db.query(sql, val)
  }

  async queryUserEmail (addr){
    let val = ['uemail', 'user', addr]
    let sql = 'select ?? from ?? where uaddr = ?'
    return db.query(sql, val)
  }

  async bindEmail (email, addr) {
    let val = ['user', email, addr]
    let sql = 'UPDATE ?? SET uemail = ? WHERE uaddr = ?'
    return db.query(sql, val)
  }
  async changeLoginPwd (addr, newPwd) {
    let val = ['user', newPwd, addr]
    let sql = 'UPDATE ?? SET upwd = ? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  async changeTradePwd (addr, newPwd) {
    let val = ['user', newPwd, addr]
    let sql = 'UPDATE ?? SET utradePwd = ? WHERE uaddr = ?'
    return db.query(sql, val)
  }

  async getUserLocationByAddr (addr) {
    let columns = [UserServerModel.longitude, UserServerModel.latitude]
    let val = [columns, 'user', addr]
    let sql = 'SELECT ?? FROM ?? WHERE uaddr = ?'
    return db.query(sql, val)
  }
}

module.exports = UserDetailModel