const Joi = require('joi')

class FeedVali {
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
}

module.exports = FeedVali 