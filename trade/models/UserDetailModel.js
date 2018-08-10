const Db = require('./Db.js')
const db = new Db()
const moment = require('moment')

const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const { UserServerModel, UserModelName } = require('../sqlModel/user.js')
const { LandAssetsServerModel, LandAssetsName } = require('../sqlModel/landAssets.js')
const { EthAddrManagerName, EthAddrManagerServerModel } = require('../sqlModel/ethAddrManager.js')

/**
  MYSQL @user
    - 查询用户的邮箱 queryUserEmail
    - 用户注册,只需要地址与密码即可 userRegister
    - 账号密登码陆 userLogin
    - 绑定邮箱 bindEmail
    - 更改用户密码 changeLoginPwd
    - 更改用户交易密码 changeTradePwd
    - 通过用户addr查询用户经纬度 getUserLocationByAddr
    - 查询该邮箱是否已经绑定 queryEmailIsExist
    - 获取addr查询邀请的注册人 queryRegisterByAddr
      - 获取注册的人数 getRegisterCountByAddr
      - 获取认证的人数 getAuthCountByAddr
    - 更改用户的state状态 changeUserState
      - 用户进行邮件绑定 authUserState
  MYSQL @landassets
     - 用户资产初始化 createUserAsset
     - 增加用户的bamboo addUserBamboo
  MYSQL @user @landassets
    - 查询指定addr的用户信息 queryUserByAddr
  MYSQL @ethaddrmanager
    - 插入ethaddrmanager insertToEthAddr
  MYSQL @事务
    - 开启事务 startTransaction
*/

class UserDetailModel {

  async startTransaction () {
    return db.startTransaction()
  }
  
	async userRegister (addr, pwd, tradePwd, email, longitude, latitude, invite) {
		let insertData = {
      [UserServerModel.addr.label]: addr,
      [UserServerModel.email.label]: email !== '' ? email : null,
      [UserServerModel.pwd.label]: pwd,
      [UserServerModel.phone.label]: null,
      [UserServerModel.tradePwd.label]: '',
      [UserServerModel.state.label]: email ? 'auth' : 'reg',
      [UserServerModel.longitude.label]: longitude,
      [UserServerModel.latitude.label]: latitude,
      [UserServerModel.invite.label]: invite,
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
      [LandAssetsServerModel.bambooLock.label]: 0,
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

  async addUserBamboo (addr, count) {
    let val = [
      LandAssetsName,
      LandAssetsServerModel.bamboo.label,
      LandAssetsServerModel.bamboo.label,
      count,
      LandAssetsServerModel.addr.label,
      addr
    ]
    let sql = 'update ?? set ?? = ?? + ? where ?? = ?'
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
    let columns = [
      'user.uk_addr',
      'user.uk_email',
      'user.utradePwd',
      'user.longitude',
      'user.latitude',
      'l.bamboo',
      'l.bamboolock',
      'l.eth',
      'l.ethLock',
      'l.eos',
      'l.eosLock',
      'm.uk_account']
  	let val = [columns, 'user', addr]
  	let sql = 'select ?? from ?? ' + 
      'inner join landassets l on user.uk_addr=l.uk_addr ' +
      'inner join ethaddrmanager m on m.uk_addr=l.uk_addr where user.uk_addr = ?'
  	return db.query(sql, val)
  }

  async queryUserEmail (addr){
    let val = [
      UserServerModel.email.label,
      UserModelName,
      UserServerModel.addr.label,
      addr
    ]
    let sql = 'select ?? from ?? where ?? = ?'
    return db.query(sql, val)
  }

  async queryEmailIsExist (email) {
    let val = [
      UserModelName,
      UserServerModel.email.label,
      email
    ]
    let sql = 'select * from ?? where ?? = ?'
    return db.query(sql, val)
  }

  async queryRegisterByAddr (addr, state) {
    const columns = [
    ]
    const val = [
      UserModelName,
      UserServerModel.invite.label,
      addr,
      UserServerModel.state.label,
      state
    ]
    let sql = 'select count(state) from ?? where ?? = ? and ?? = ?'
    return db.query(sql, val)
  }

  async getRegisterCountByAddr (addr) {
    const queryRegisters = await this.queryRegisterByAddr(addr, 'reg')
    if (!queryRegisters) return new Error(CommonCodes.Service_Wrong)
    if (queryRegisters.length > 0) {
      return Number(queryRegisters[0]['count(state)'])
    } else {
      return 0
    }
  }

  async getAuthCountByAddr (addr) {
    const queryRegisters = await this.queryRegisterByAddr(addr, 'auth')
    if (!queryRegisters) return new Error(CommonCodes.Service_Wrong)
    if (queryRegisters.length > 0) {
      return Number(queryRegisters[0]['count(state)'])
    } else {
      return 0
    }
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

  async changeUserState (addr, state) {
    let val = [
      UserModelName,
      UserServerModel.state.label,
      state,
      UserServerModel.addr.label,
      addr
    ]
    console.log('val', val)
    let sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    return db.query(sql, val)
  }

  async authUserState (addr) {
    const changeState = await this.changeUserState(addr, 'auth')
    if (!changeState) return new Error(CommonCodes.Service_Wrong)
    return changeState
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

  async insertToEthAddr (addr, account, priviteKey) {
    let insertData = {
      [EthAddrManagerServerModel.addr.label]: addr,
      [EthAddrManagerServerModel.account.label]: account,
      [EthAddrManagerServerModel.private_key.label]: priviteKey,
      [EthAddrManagerServerModel.gmt_create.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      [EthAddrManagerServerModel.gmt_modified.label]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    let val = [
      EthAddrManagerName, insertData
    ]
    let sql = 'INSERT INTO ?? SET ?'
    return db.query(sql, val)
  }
}

module.exports = UserDetailModel