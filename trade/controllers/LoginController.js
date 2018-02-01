const url = require('url')
const LoginModel = require('../models/LoginModel.js')
const LoginVali = require('./LoginVali.js')

const loginModel = new LoginModel()
const loginVali = new LoginVali()

class LoginController {
	constructor () {
		// loginModel.selectAllData()
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
		let valiRes = loginVali.getTag(params)
		if (valiRes.error === null) {
			let queryRes = loginModel.queryTagData()
			console.log(queryRes)
		} else {
			cyx.body = valiRes.error
			console.log(valiRes.error)
		}
	}

	// 新用户注册
	userRegister (ctx) {
		// TODO 前端进行数据格式校验
		ctx.body = `Request-body: ${JSON.stringify(ctx.request.body)}`
		let requestData = ctx.request.body
		let registerData = {
			email: requestData.email,
			pwd: requestData.pwd
		}
		// TODO 判断邮箱是否注册过 queryUserByEmail
		loginModel.queryUserByEmail(registerData.email).then((v)=> {
			if (v.length === 0) { // 邮箱未注册过
				loginModel.insertUser(registerData.email, registerData.pwd).then((v) => {
					console.log('注册成功')
				}, (e) => {
					console.log('注册失败')
				})
			} else {
				console.log('邮箱已被注册')
			} 
		}, (e)=> {
			console.log('error', e)
		})

	}
	userLogin (ctx) {
		
	}

	LoginApiTest (ctx) {

	}
}

module.exports = LoginController