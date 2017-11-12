const url = require('url')
const Rating = require('../models/Rating.js')
const FeedVali = require('./validate.js')

const rating = new Rating()
const feedVali = new FeedVali()

class FeedbackController {
	constructor () {
		// rating.selectAllData()
	}
	async gettag (ctx) {
		/**
		 * [params] GET方式两种获取参数
		 * 《1》ctx.query['param']
		 * 《2》url.parse(ctx.request.url, true).query
		 */
		if (ctx.request.method !== 'GET') {
			ctx.body = 'gettag接口是GET请求'
			return
		}
		let params = {
			Sid: ctx.query['Sid'],
			Cid: ctx.query['Cid'],
			content: ctx.query['content']
		}
		let valiRes = feedVali.getTag(params)
		if (valiRes.error === null) {
			let queryRes = rating.queryTagData()
			console.log(queryRes)
		} else {
			cyx.body = valiRes.error
			console.log(valiRes.error)
		}
	}
	async subVisitRating (ctx) {
		ctx.body = `Request-body: ${JSON.stringify(ctx.request.body)}`
	}
}

module.exports = FeedbackController