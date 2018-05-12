const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')

const { UserServerModel, UserModelName } = require('../sqlModel/user.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')

/**
  MYSQL @user
    - 查询用户的邮箱 queryUserEmail
    - 用户注册,只需要地址与密码即可 userRegister
    - 账号密登码陆 userLogin
    - 绑定邮箱 bindEmail
    - 更改用户密码 changeLoginPwd
    - 更改用户交易密码 changeTradePwd
    - 通过用户addr查询用户经纬度 getUserLocationByAddr
  MYSQL @landassets
     - 用户资产初始化 createUserAsset
  MYSQL @user @landassets
    - 查询指定addr的用户信息 queryUserByAddr
*/

class UserDetailModel {
	async userRegister (addr, pwd, tradePwd, email, longitude, latitude) {
		let insertData = {
      [UserServerModel.addr.label]: addr,
      [UserServerModel.email.label]: email !== '' ? email : null,
      [UserServerModel.pwd.label]: pwd,
      [UserServerModel.phone.label]: null,
      [UserServerModel.tradePwd.label]: '',
      [UserServerModel.state.label]: 'reg',
      [UserServerModel.longitude.label]: longitude,
      [UserServerModel.latitude.label]: latitude,
      [UserServerModel.gmt_create.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      [UserServerModel.gmt_modified.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    let val = [
      UserModelName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
	}

  async createUserAsset (addr) {
    let insertData = {
      [LandAssetsServerModel.addr.label]: addr,
      [LandAssetsServerModel.bamboo.label]: 0,
      [LandAssetsServerModel.bamboolock.label]: 0,
      [LandAssetsServerModel.eth.label]: 0,
      [LandAssetsServerModel.ethLock.label]: 0,
      [LandAssetsServerModel.eos.label]: 0,
      [LandAssetsServerModel.eosLock.label]: 0
    }
    let val = [
      LandAssetsName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val) 
  }

	async userLogin (addr, pwd) {
		let val = [
      UserModelName,
      UserServerModel.addr.label,
      addr,
      UserServerModel.pwd.label,
      pwd
    ]
    let sql = 'SELECT * FROM ?? WHERE ??= ? && ??= ?'
    return db.query(sql, val)
  }

  async queryUserByAddr (addr) {
  	let val = ['user', addr]
  	let sql = 'select * from ?? inner join landassets l on user.uk_addr=l.uk_addr where user.uk_addr = ?'
  	return db.query(sql, val)
  }

  async queryUserEmail (addr){
    let val = [
      UserServerModel.email.label,
      UserModelName,
      addr
    ]
    let sql = 'select ?? from ?? where uaddr = ?'
    return db.query(sql, val)
  }

  async bindEmail (email, addr) {
    let val = [
      UserModelName,
      UserServerModel.email.label,
      email,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }
  async changeLoginPwd (addr, newPwd) {
    let val = [
      UserModelName,
      UserServerModel.pwd.label,
      newPwd,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async changeTradePwd (addr, newPwd) {
    let val = [
      UserModelName,
      UserServerModel.tradePwd.label,
      newPwd,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async getUserLocationByAddr (addr) {
    let columns = [UserServerModel.longitude.label, UserServerModel.latitude.label]
    let val = [
      columns,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    return db.query(sql, val)
  }
}

module.exports = UserDetailModel