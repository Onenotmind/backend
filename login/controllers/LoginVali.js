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
}

module.exports = LoginVali 