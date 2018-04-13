const UserDetailModel = require('../models/UserDetailModel.js')
const userDetailModel = new UserDetailModel()
const { LoginCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')
const JoiParamVali = require('../libs/JoiParamVali.js')
const { getParamsCheck, postParamsCheck, decrypt, encrypt } = require('../libs/CommonFun.js')
const { sendCodeFromMail } = require('./libs/mailer.js')
const joiParamVali = new JoiParamVali()

/**
	@UserDetailController
		查询指定addr的用户信息 queryUserByAddr
		用户注册,只需要地址与密码即可 userRegister
		账号密码登陆 userLogin
		更改用户密码 changeLoginPwd
		更改用户交易密码 changeTradePwd
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
		if (!params) return errorRes(LoginCodes.Params_Check_Fail)
		const addrVali = await joiParamVali.valiAddr(params[0])
		const pwdVali = await joiParamVali.valiPass(params[1])
		if (!addrVali || !pwdVali) {
			return errorRes(CommonCodes.Params_Check_Fail)
		}
		if (email) {
			const emailVali = await joiParamVali.valiEmail(params[3])
			if (!emailVali) {
				return errorRes(CommonCodes.Params_Check_Fail)
			}
			if (ctx.cookies && ctx.cookies.get('tmpUserId')) {
	      code = ctx.cookies.get('tmpUserId')
	    }
	    let decryptRes = parseInt(decrypt(code, email))
	    if (decryptRes - 1 !== clientCode) {
	      ctx.body = errorRes(LoginCodes.Code_Error)
	      return
	    }
		}
		const register = await userDetailModel.userRegister(addr, pwd, '', email, ...this.geneLocation)
		if (register) {
			return register
		} else {
			return errorRes(register.message)
		}
	}

	async userLogin (addr, pwd) {
		const addrVali = await joiParamVali.valiAddr(addr)
		const pwdVali = await joiParamVali.valiPass(pwd)
		if (!addrVali || !pwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const login = await userDetailModel.userLogin(addr, pwd)
		if (login) {
			return login
		} else {
			return new Error(login)
		}
	}

	async changeLoginPwd (addr, oldPwd, newPwd) {
		const addrVali = await joiParamVali.valiAddr(addr)
		const oldPwdVali = await joiParamVali.valiPass(oldPwd)
		const newPwdVali = await joiParamVali.valiPass(newPwd)
		if (!addrVali || !pwdVali || !newPwd) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const oldPwdCheck = await this.userLogin(addr, oldPwd)
		if (!oldPwdCheck) return new Error(oldPwdCheck)
		if (oldPwdCheck.length === 0) return new Error('No such person')
		const newPwdChange = await userDetailModel.changeLoginPwd(addr, newPwd)
		if (newPwdChange) {
			return newPwdChange
		} else {
			return new Error(newPwdChange)
		}
	}

	async changeTradePwd (addr, oldPwd, newPwd) {
		const addrVali = await joiParamVali.valiAddr(addr)
		const oldPwdVali = await joiParamVali.valiPass(oldPwd)
		const newPwdVali = await joiParamVali.valiPass(newPwd)
		if (!addrVali || !pwdVali || !newPwd) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		const newPwdChange = await userDetailModel.changeTradePwd(addr, newPwd)
		if (newPwdChange) {
			return newPwdChange
		} else {
			return new Error(newPwdChange)
		}
	}

	async getUserLocationByAddr (addr) {
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
   * 产生验证码 geneEmailCode 工具函数
   * @property {string} email 
   */
	async function geneEmailCode (email) {
	  let code = Math.ceil(Math.random()*10000)
	  let encryptCode = encrypt(code + 1, email)
	  ctx.cookies.set(
	    'tmpUserId',
	    encryptCode,
	    {
	      // expires: new Date() + 60*1000,  // cookie失效时间
	      httpOnly: true
	    }
	  )
	  const sendCode = await sendCodeFromMail(email, code)
	  if (!sendCode) return false
	  return true
	}

	geneLocation () {
		return [123.1, -23.5]
	}
}

module.exports = UserDetailController