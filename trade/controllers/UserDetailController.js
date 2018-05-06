const _ = require('lodash')
const UserDetailModel = require('../models/UserDetailModel.js')
const userDetailModel = new UserDetailModel()
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
		const paramsType = ['addr', 'pwd', 'email', 'code']
		const params= await postParamsCheck(ctx, paramsType)
		if (!params) return new Error(LoginCodes.Params_Check_Fail)
		const addr = params.addr
		const pwd = params.pwd
		const email = params.email
		const code = params.code
		let tmpCode = null
		const addrVali = await joiParamVali.valiAddr(addr)
		const pwdVali = await joiParamVali.valiPass(pwd)
		if (!addrVali || !pwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
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
		}
		const login = await userDetailModel.userLogin(addr, pwd)
	  if (login && login.length > 0) {
	    return new Error(LoginCodes.Email_Exist)
	  }
	  const location = this.geneLocation()
		const register = await userDetailModel.userRegister(addr, pwd, '', email, ...location)
		if (!register) return register
		const assets = await userDetailModel.createUserAsset(addr)
		return assets
	}


	/**
   * 用户登陆 userLogin
   * @property {string} addr
   * @property {string} pwd
   */
	async userLogin (ctx) {
		const addr = ctx.query['addr']
		const pwd = ctx.query['pwd']
		const addrVali = await joiParamVali.valiAddr(addr)
		const pwdVali = await joiParamVali.valiPass(pwd)
		if (!addrVali || !pwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const login = await userDetailModel.userLogin(addr, pwd)
		if (!login || login.length === 0) return new Error(LoginCodes.Login_DataWrong)
		return login
	}

	/**
   * 修改登陆密码 changeLoginPwd
   * @property {string} addr
   * @property {string} oldPwd
   * @property {string} newPwd
   */
	async changeLoginPwd (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = ['addr', 'oldPwd', 'newPwd']
		const params= await postParamsCheck(ctx, paramsType)
		if (!params) return errorRes(LoginCodes.Params_Check_Fail)
		const addr = params.addr
		const oldPwd = params.oldPwd
		const newPwd = params.newPwd
		const addrVali = await joiParamVali.valiAddr(addr)
		const oldPwdVali = await joiParamVali.valiPass(oldPwd)
		const newPwdVali = await joiParamVali.valiPass(newPwd)
		if (!addrVali || !oldPwdVali || !newPwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const oldPwdCheck = await userDetailModel.userLogin(addr, oldPwd)
		if (!oldPwdCheck) return oldPwdCheck
		if (oldPwdCheck.length === 0) return new Error('No such person')
		const newPwdChange = await userDetailModel.changeLoginPwd(addr, newPwd)
		if (newPwdChange) {
			return newPwdChange
		} else {
			return new Error(LoginCodes.Change_Login_Pwd_Fail)
		}
	}

	/**
		*	查询用户的邮箱 queryUserEmail
		*/
	async queryUserEmail (ctx) {
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!addrVali) return new Error(CommonCodes.Params_Check_Fail)
		const email = await userDetailModel.queryUserEmail(addr)
		return email
	}

	/**
		*	忘记密码 changePwdWhenForget
		*/
	async changePwdWhenForget (ctx) {
		const pwd = ctx.query['pwd']
		const addr = ctx.query['addr']
		const code = ctx.query['code']
		const pwdVali = await joiParamVali.valiPass(pwd)
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!pwdVali || !addrVali) return new Error(CommonCodes.Params_Check_Fail)
		const email = await userDetailModel.queryUserEmail(addr)
		if (!email || email.length === 0) return new Error(LoginCodes.User_Not_Bind_Email)
		let tmpCode = null
		if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
      tmpCode = ctx.cookies.get('tmpUserId')
    }
    let decryptRes = parseInt(decrypt(tmpCode, email[0].uemail))
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
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const paramsType = ['addr', 'newPwd', 'code']
		const params= await postParamsCheck(ctx, paramsType)
		if (!params) return errorRes(LoginCodes.Params_Check_Fail)
		const addr = params.addr
		const newPwd = params.newPwd
		const code = params.code
		const addrVali = await joiParamVali.valiAddr(addr)
		const newPwdVali = await joiParamVali.valiPass(newPwd)
		if (!addrVali || !newPwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const email = await userDetailModel.queryUserEmail(addr)
		if (!email) return new Error(LoginCodes.User_Not_Bind_Email)
		let tmpCode = null
		if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
      tmpCode = ctx.cookies.get('tmpUserId')
    }
   let decryptRes = parseInt(decrypt(tmpCode, email[0].uemail))
   if (decryptRes - 1 !== parseInt(code)) {
     return errorRes(LoginCodes.Code_Error)  
   }
		const newPwdChange = await userDetailModel.changeTradePwd(addr, newPwd)
		if (newPwdChange) {
			return newPwdChange
		} else {
			return new Error(LoginCodes.Change_Trade_Pwd_Fail)
		}
	}

	/**
   * 通过用户addr查询用户经纬度
   * @property {string} addr
   */
	async getUserLocationByAddr (ctx) {
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!addrVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const location = await userDetailModel.getUserLocationByAddr(addr)
		if (location) {
			return location
		} else {
			return new Error(location)
		}
	}

	/**
   * 通过用户addr查询用户详细信息 getUserInfoAndAssetsByAddr
   * @property {string} addr
   */
	async getUserInfoAndAssetsByAddr (ctx) {
		const token = ctx.request.headers['token']
		const checkAddr = ctx.cookies.get('userAddr')
		const tokenCheck = await checkToken(token, checkAddr)
		if (!tokenCheck) return new Error(CommonCodes.Token_Fail)
		const addr = ctx.query['addr']
		const addrVali = await joiParamVali.valiAddr(addr)
		if (!addrVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
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
			const checkAddr = ctx.cookies.get('userAddr')
			const emailBind = await userDetailModel.bindEmail(email, checkAddr)
			return emailBind
		} else {
			return emailCheck
		}
	}

	/**
   * 用户注册 checkEmailCode
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

	geneLocation () {
		return [123.1, -23.5]
	}
}

module.exports = UserDetailController