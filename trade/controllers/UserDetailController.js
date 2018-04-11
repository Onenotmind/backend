const UserDetailModel = require('../models/UserDetailModel.js')
const userDetailModel = new UserDetailModel()
const { CommonCodes } = require('../libs/msgCodes/StatusCodes.js')
const JoiParamVali = require('../libs/JoiParamVali.js')
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
*/

class UserDetailController {
	async userRegister (addr, pwd, email) {
		const addrVali = await joiParamVali.valiAddr(addr)
		const pwdVali = await joiParamVali.valiPass(pwd)
		if (!addrVali || !pwdVali) {
			return new Error(CommonCodes.Params_Check_Fail)
		}
		if (email) {
			const emailVali = await joiParamVali.valiEmail(email)
			if (!emailVali) {
				return new Error(CommonCodes.Params_Check_Fail)
			}
		}
		const register = await userDetailModel.userRegister(addr, pwd, '', email, ...this.geneLocation)
		if (register) {
			return register
		} else {
			return new Error(register)
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

	geneLocation () {
		return [123.1, -23.5]
	}
}

module.exports = UserDetailController