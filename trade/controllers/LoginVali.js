const Joi = require('joi')

class LoginVali {
	constructor () {
		// TODO
	}
	getTag (params) {
		let getTagSchema = Joi.object({
			Sid: Joi.string().min(1).max(30).required(),
			Cid: Joi.string().required(),
			content: Joi.string()
		})
		return Joi.validate(params, getTagSchema)
	}
	checkLoginInfo (params) {
		// let loginInfoSchema = J
	}
	// 验证注册数据是否合法
	checkRegisterData (params, succCb, errCb) {
		let registerData = Joi.object({
			email: Joi.string().email().required(),
			pwd: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
		})
		Joi.validate(params, registerData, (err) => {
			if (err === null) {
				succCb()
			} else {
				errCb()
			}
		})
	}
}

module.exports = LoginVali 