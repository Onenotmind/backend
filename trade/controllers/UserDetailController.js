const _ = require('lodash')
const axios = require('axios')
const async = require('async')
const qs = require('qs')
const Web3 = require('web3')
const web3 = new Web3()
const UserDetailModel = require('../models/UserDetailModel.js')
const userDetailModel = new UserDetailModel()
const { UserServerModel } = require('../sqlModel/user.js')
const { LoginCodes, errorRes, serviceError, succRes, CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const JoiParamVali = require('../libs/JoiParamVali.js')
const { getParamsCheck, checkUserToken, checkGetParams, postParamsCheck, decrypt, encrypt, geneToken, checkToken } = require('../libs/CommonFun.js')
const { sendCodeFromMail } = require('../libs/mailer.js')
const joiParamVali = new JoiParamVali()

/**
	@UserDetailController
		查询指定addr的用户信息 getUserInfoAndAssetsByAddr
		用户注册,只需要地址与密码即可 userRegister
		查询用户的邮箱 queryUserEmail
		账号密码登陆 userLogin
		更改用户密码 changeLoginPwd
		更改用户交易密码 changeTradePwd
		忘记密码 changePwdWhenForget
		绑定邮箱 bindEmail
		检测验证码正确与否 CheckEmailCode
		通过用户addr查询用户经纬度 getUserLocationByAddr
		获取用户参与挖矿得到的bamboo数量 getUserBamboo
		检测用户是否还在登陆状态,判断token checkUserLoginExpired
	@通过方法
		随机生成地址(经纬度) geneLocation
		发送验证码 geneEmailCode
*/

class UserDetailController {

	/**
   * 用户注册 userRegister
   * @property {string} addr
   * @property {string} pwd
   * @property {string} email 非必要
   * @property {string} code 非必要
   */
	async userRegister (ctx) {
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			},
			{
				label: 'pwd',
				vali: 'valiPass'
			},
			{
				label: 'email',
				vali: 'null'
			},
			{
				label: 'code',
				vali: 'null'
			}
		]
		const params= await postParamsCheck(ctx, paramsType)
		console.log('params', params)
		if (_.isError(params)) return params
		const addr = params.addr
		const pwd = params.pwd
		const email = params.email
		const code = params.code
		let tmpCode = null
		// const addrVali = await joiParamVali.valiAddr(addr)
		// const pwdVali = await joiParamVali.valiPass(pwd)
		// if (!addrVali || !pwdVali) {
		// 	return new Error(CommonCodes.Params_Check_Fail)
		// }
		if (email !== '') {
			const emailVali = await joiParamVali.valiEmail(email)
			if (_.isError(emailVali)) {
				return emailVali
			}
			const queryEmail = userDetailModel.queryEmailIsExist(email)
			if (!queryEmail) return queryEmail
			if (queryEmail.length > 0) return new Error(LoginCodes.Email_Already_Exist)
			if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
	      tmpCode = ctx.cookies.get('tmpUserId')
	    }
	    let decryptRes = parseInt(decrypt(tmpCode, email))
	    if (decryptRes - 1 !== parseInt(code)) {
	      return new Error(LoginCodes.Code_Error)  
	    }
		}
		const login = await userDetailModel.userLogin(addr, pwd)
	  if (login && login.length > 0) {
	    return new Error(LoginCodes.Email_Exist)
	  }
	  const trans = await userDetailModel.startTransaction()
		if (!trans) return new Error(CommonCodes.Service_Wrong)
		console.log('begin user trans')
		let self = this
		let tasks = [
			async function () {
				const location = self.geneLocation()
				const register = await userDetailModel.userRegister(addr, pwd, '', email, ...location)
				return register
			},
			async function (res) {
				console.log('res', res)
				if (_.isError(res)) return res
				const assets = await userDetailModel.createUserAsset(addr)
				return assets
			},
			async function (res) {
				console.log('res', res)
				if (_.isError(res)) return res
	  		const ethaccount = web3.eth.accounts.create()
				const ethAddr = await userDetailModel.insertToEthAddr(addr, ethaccount.address, ethaccount.privateKey)
				return ethAddr
			},
			function (res, callback) {
				console.log('res', res)
				if (_.isError(res)) {
					callback(res)
				} else {
					callback(null, res)
				}
			}
		]
	  return new Promise((resolve, reject) => {
			trans.beginTransaction(function (bErr) {
				if (bErr) {
					reject(bErr)
					return
				}
				async.waterfall(tasks, function (tErr, res) {
		      if (tErr) {
		        trans.rollback(function () {
		          trans.release()
		          reject(tErr)
		        })
		      } else {
		        trans.commit(function (err, info) {
		          if (err) {
		            trans.rollback(function (err) {
		              trans.release()
		              reject(err)
		            })
		          } else {
		            trans.release()
		            resolve(res)
		          }
		        })
		      }
		    })
			})
		})
	}


	/**
   * 用户登陆 userLogin
   * @property {string} addr
   * @property {string} pwd
   */
	async userLogin (ctx) {
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			},
			{
				label: 'pwd',
				vali: 'valiPass'
			}
		]
		const valiParams = await getParamsCheck(ctx, paramsType)
		if (_.isError(valiParams)) return valiParams
		const addr = ctx.query['addr']
		const pwd = ctx.query['pwd']
		const login = await userDetailModel.userLogin(addr, pwd)
		if (!login || login.length === 0) return new Error(LoginCodes.Login_DataWrong)
		return login
	}

	/**
   * 修改登陆密码 changeLoginPwd 'addr', 'oldPwd', 'newPwd'
   * @property {string} addr
   * @property {string} oldPwd
   * @property {string} newPwd
   */
	async changeLoginPwd (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			},
			{
				label: 'oldPwd',
				vali: 'valiPass'
			},
			{
				label: 'newPwd',
				vali: 'valiPass'
			}
		]
		const params= await postParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params
		const addr = params.addr
		const oldPwd = params.oldPwd
		const newPwd = params.newPwd
		const oldPwdCheck = await userDetailModel.userLogin(addr, oldPwd)
		if (!oldPwdCheck) return oldPwdCheck
		if (oldPwdCheck.length === 0) return new Error(LoginCodes.Login_IllegalData)
		const newPwdChange = await userDetailModel.changeLoginPwd(addr, newPwd)
		return newPwdChange
	}

	/**
		*	查询用户的邮箱 queryUserEmail
		*/
	async queryUserEmail (ctx) {
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (_.isError(addrVali)) return addrVali
		const email = await userDetailModel.queryUserEmail(addr)
		return email
	}

	/**
		*	忘记密码 changePwdWhenForget
		*/
	async changePwdWhenForget (ctx) {
		const paramsType = [
			{
				label: 'pwd',
				vali: 'valiPass'
			},
			{
				label: 'addr',
				vali: 'valiAddr'
			}
		]
		const params= await getParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params 
		const pwd = ctx.query['pwd']
		const addr = ctx.query['addr']
		const code = ctx.query['code']
		const email = await userDetailModel.queryUserEmail(addr)
		if (!email || email.length === 0) return new Error(LoginCodes.User_Not_Bind_Email)
		let tmpCode = null
		if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
      tmpCode = ctx.cookies.get('tmpUserId')
    }
    let decryptRes = parseInt(decrypt(tmpCode, email[0][UserServerModel.email.label]))
    console.log(decryptRes)
    if (decryptRes - 1 !== parseInt(code)) {
      return new Error(LoginCodes.Code_Error) 
    }
    const newPwdChange = await userDetailModel.changeLoginPwd(addr, pwd)
    return newPwdChange
	}

	/**
   * 修改交易密码 changeTradePwd
   * @property {string} addr
   * @property {string} newPwd
   */
	async changeTradePwd (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			},
			{
				label: 'newPwd',
				vali: 'valiPass'
			},
			{
				label: 'code',
				vali: 'null'
			}
		]
		const params= await postParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params
		const addr = params.addr
		const newPwd = params.newPwd
		const code = params.code
		const email = await userDetailModel.queryUserEmail(addr)
		if (!email) return new Error(LoginCodes.User_Not_Bind_Email)
		let tmpCode = null
		if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
      tmpCode = ctx.cookies.get('tmpUserId')
    }
   let decryptRes = parseInt(decrypt(tmpCode, email[0][UserServerModel.email.label]))
   if (decryptRes - 1 !== parseInt(code)) {
     return new Error(LoginCodes.Code_Error)  
   }
		const newPwdChange = await userDetailModel.changeTradePwd(addr, newPwd)
		return newPwdChange
	}

	/**
   * 通过用户addr查询用户经纬度
   * @property {string} addr
   */
	async getUserLocationByAddr (ctx) {
		const addr = ctx.query['addr']
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			}
		]
		const params= await getParamsCheck(ctx, paramsType)
		if (_.isError(params)) return params
		const location = await userDetailModel.getUserLocationByAddr(addr)
		return location
	}

	/**
   * 通过用户addr查询用户详细信息 getUserInfoAndAssetsByAddr
   * @property {string} addr
   */
	async getUserInfoAndAssetsByAddr (ctx) {
		const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const paramsType = [
			{
				label: 'addr',
				vali: 'valiAddr'
			}
		]
		const params= await getParamsCheck(ctx, paramsType)
		const userInfo = await userDetailModel.queryUserByAddr(addr)
		if (userInfo) {
			return userInfo[0]
		} else {
			return new Error(LoginCodes.Service_Wrong)
		} 
	}

	/**
		*	绑定邮箱 bindEmail
		*/
	async bindEmail (ctx) {
		const emailCheck = await this.checkEmailCode(ctx)
		if (!_.isError(emailCheck)) {
			const email = ctx.query['email']
			const queryEmail = userDetailModel.queryEmailIsExist(email)
			if (!queryEmail) return queryEmail
			if (queryEmail.length > 0) return new Error(LoginCodes.Email_Already_Exist)
			const checkAddr = ctx.cookies.get('userAddr')
			const emailBind = await userDetailModel.bindEmail(email, checkAddr)
			return emailBind
		} else {
			return emailCheck
		}
	}

	/**
   * 检测验证码正确与否 checkEmailCode
   * @property {string} addr
   * @property {string} code 
   */

   async checkEmailCode (ctx) {
   	let tmpCode = null
   	const email = ctx.query['email']
   	const code = ctx.query['code']
   	if (email !== '') {
			const emailVali = await joiParamVali.valiEmail(email)
			if (!emailVali) {
				return new Error(CommonCodes.Params_Check_Fail)
			}
			if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
	      tmpCode = ctx.cookies.get('tmpUserId')
	    }
	    let decryptRes = parseInt(decrypt(tmpCode, email))
	    if (decryptRes - 1 !== parseInt(code)) {
	      return new Error(LoginCodes.Code_Error)  
	    }
	    return {}
		} else {
			return new Error(CommonCodes.Params_Check_Fail)
		}
  }

  async getUserBamboo (ctx) {
  	if (!checkUserToken(ctx)) return new Error(CommonCodes.Token_Fail)
    const addr = ctx.query['addr']
  	const hash = ctx.query['hash']
  	const addrVali = await joiParamVali.valiAddr(addr)
  	if (!addrVali) return new Error(CommonCodes.Params_Check_Fail)
  	const res = await axios.get('https://api.coinhive.com/user/balance', {
	    params: {
	      secret: '0ikXmamkqZFpcJVxTJ44D1LBC4zSD6Nu',
	      name: hash
	    }
	  })
  	let acceptHash = parseInt(ctx.query['acceptHash'])
  	if (!res || !res.data) return new Error(LoginCodes.Get_Combo_Data_Fail)
  	// let preHash = 0
  	// if (ctx.cookies && ctx.cookies.get('hash')) {
   //    preHash = ctx.cookies.get('hash')
   //  }
    // if (acceptHash > parseInt(res.data.total)) return new Error(LoginCodes.Get_Combo_Data_Fail)
    let addCount = parseInt(parseInt(res.data.total) / 100)
    addCount = addCount > 0 ? addCount : 0
    const resetRes = await axios.post('https://api.coinhive.com/user/reset', qs.stringify({
	    secret: '0ikXmamkqZFpcJVxTJ44D1LBC4zSD6Nu',
	    name: hash
	  }))
	    console.log('hash..res', resetRes.data)
	  if (resetRes.data.success) {
	  	const addBamboo = await userDetailModel.addUserBamboo(addr, addCount)
  		if (!addBamboo) return new Error(LoginCodes.Get_Combo_Data_Fail)
  		return addCount
	  } else {
	  	return new Error('reset hash fail')
	  }
  }

  async checkUserLoginExpired (ctx) {
  	const tokenCheck = await checkUserToken(ctx)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		return true
  }

	geneLocation () {
		const longitude = parseInt(Math.random() * 360 - 180)
		const latitude = parseInt(Math.random() * 180 - 90)
		return [longitude, latitude]
	}
}

module.exports = UserDetailController