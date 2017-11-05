const Rating = require('../models/Rating.js')
const rating = new Rating()

class FeedbackController {
	constructor () {
		rating.getAllData()
	}
	gettag (ctx) {
		ctx.body = `Request-method: ${ctx.request.method} ... Request-body: ${ctx.query['tchid']}`
	}
	async subVisitRating (ctx) {
		ctx.body = `Request-body: ${JSON.stringify(ctx.request.body)}`
	}
}

module.exports = FeedbackController