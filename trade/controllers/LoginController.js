// const url = require('url')
const LoginModel = require('../models/LoginModel.js')
const LoginVali = require('./LoginVali.js')

const loginModel = new LoginModel()
const loginVali = new LoginVali()
const { UserClientModel } = require('../sqlModel/user.js')
const { LoginCodes, loginErrorRes, serviceError, loginSuccRes } = require('../libs/msgCodes/LoginErrorCodes.js')

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
    let ctxRes = null
    // TODO 判断邮箱是否注册过 queryUserByEmail
    return loginVali.checkRegisterData(registerData) // 数据格式验证
    .then(v => {
      return loginModel.queryUserByEmail(registerData.email)
      .then((v) => {
        if (v.length === 0) { // 邮箱未注册过
          return loginModel.insertUser(registerData.email, registerData.pwd)
          .then((v) => {
            return loginSuccRes(LoginCodes.Register_Succ, {})
          })
          .catch((e) => {
            return loginErrorRes(LoginCodes.Register_Failed)
          })
        } else {
          return loginErrorRes(LoginCodes.Email_Exist)
        }
      })
      .catch((e) => {
        return serviceError()
      })
    })
    .catch(e => {
      console.log(e)
      return loginErrorRes(LoginCodes.Params_Check_Fail)
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
          return loginSuccRes(LoginCodes.Login_Succ, {id: 1})
        } else {
          return loginErrorRes(LoginCodes.Login_No_Account)
        }
      })
      .catch((e) => {
        return serviceError()
      })
    })
    .catch((e) => {
      return loginErrorRes(LoginCodes.Login_IllegalData)
    })
  }

  changeLoginPass (ctx) {

  }

  // 封装GET请求的参数
  getParamsCheck (ctx, paramsArray) {
    if (ctx.request.method !== 'GET') {
      // ctx.body = '接口请求方式必须为GET'
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
      // ctx.body = '接口请求方式必须为POST'
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
