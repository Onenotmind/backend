// const url = require('url')
const LoginModel = require('../models/LoginModel.js')
const LoginVali = require('./LoginVali.js')

const loginModel = new LoginModel()
const loginVali = new LoginVali()
const { UserClientModel } = require('../sqlModel/user.js')
const loginRes = require('../libs/msgCodes/LoginErrorCodes.js')

class LoginController {
  constructor () {
    // loginModel.selectAllData()
  }
  /**
    * [params] GET方式两种获取参数
    * 《1》ctx.query['param']
    * 《2》url.parse(ctx.request.url, true).query
  */

  // 新用户注册
  userRegister (ctx) {
    let params = [UserClientModel.email, UserClientModel.pwd]
    let registerData = this.postParamsCheck(ctx, params)
    let flag = false
    loginVali.checkRegisterData(registerData).catch((e) => {
      console.log('参数校验失败')
      flag = true
    })
    if (flag) return
    // TODO 判断邮箱是否注册过 queryUserByEmail
    loginModel.queryUserByEmail(registerData.email).then((v) => {
      if (v.length === 0) { // 邮箱未注册过
        loginModel.insertUser(registerData.email, registerData.pwd).then((v) => {
          console.log('注册成功')
        }, (e) => {
          console.log('注册失败')
        })
      } else {
        console.log('邮箱已被注册')
      }
    }, (e) => {
      console.log('error', e)
    })
  }

  // 用户登陆
  userLogin (ctx) {
    let params = [UserClientModel.email, UserClientModel.pwd]
    let loginData = this.getParamsCheck(ctx, params)
    let ctxRes = null
    return loginVali.checkLoginData(loginData)
    .then((v) => {
      return loginModel.userLogin(loginData.email, loginData.pwd)
      .then((v) => {
        if (v.length > 0) {
          ctxRes = loginRes.loginSucc({id: 1})
          return JSON.stringify(ctxRes)
        } else {
          ctxRes = loginRes.loginAccountFailed()
        }
      })
      .catch((e) => {
        ctxRes = loginRes.serviceError()
      })
    })
    .catch((e) => {
      ctxRes = loginRes.loginIllegalFailed()
    })
  }

  changeLoginPass (ctx) {

  }

  // 封装GET请求的参数
  getParamsCheck (ctx, paramsArray) {
    if (ctx.request.method !== 'GET') {
      ctx.body = '接口请求方式必须为GET'
      return null
    }
    let params = {}
    paramsArray.forEach((element) => {
      params[element] = ctx.query[element]
    })
    return params
  }

  // 封装POST请求的参数
  postParamsCheck (ctx, paramsArray) {
    if (ctx.request.method !== 'POST') {
      ctx.body = '接口请求方式必须为POST'
      return null
    }
    let requestData = ctx.request.body
    let params = {}
    paramsArray.forEach((element) => {
      params[element] = requestData[element] || ''
    })
    return params
  }
}

module.exports = LoginController
