// const url = require('url')
const LoginModel = require('../models/LoginModel.js')
const LoginVali = require('./LoginVali.js')

const loginModel = new LoginModel()
const loginVali = new LoginVali()
const { UserClientModel } = require('../sqlModel/user.js')
const { LoginCodes, errorRes, serviceError, succRes } = require('../libs/msgCodes/StatusCodes.js')

/**
  LoginController:
    - 注册
      - eth addr注册 userRegisterByRandom
      - ethland addr登陆 landLogin
    - getUserInfoByAddr 查询用户详细信息
*/
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
            return succRes(LoginCodes.Register_Succ, {})
          })
          .catch((e) => {
            return errorRes(LoginCodes.Register_Failed)
          })
        } else {
          return errorRes(LoginCodes.Email_Exist)
        }
      })
      .catch((e) => {
        return serviceError()
      })
    })
    .catch(e => {
      console.log(e)
      return errorRes(LoginCodes.Params_Check_Fail)
    })
  }

  // 用户随机注册通过地址
  userRegisterByRandom (addr) {
    let longitude = parseInt(Math.random() * 360) - 180
    let latitude = parseInt(Math.random() * 360) - 180
    return loginModel.queryUserByAdde(addr)
    .then((v) => {
      if (v.length === 0) { 
        return loginModel.insertUserByAddr(addr.toString(), longitude.toString(), latitude.toString())
        .then((v) => {
          return succRes(LoginCodes.Register_Succ, {})
        })
        .catch((e) => {
          return errorRes(LoginCodes.Register_Failed)
        })
      } else {
        return errorRes(LoginCodes.Email_Exist)
      }
    })
    .catch((e) => {
      return serviceError()
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
          return succRes(LoginCodes.Login_Succ, {})
        } else {
          return errorRes(LoginCodes.Login_No_Account)
        }
      })
      .catch((e) => {
        return serviceError()
      })
    })
    .catch((e) => {
      return errorRes(LoginCodes.Login_IllegalData)
    })
  }
  // 重置登陆密码
  changeLoginPass (ctx) {
    let params = [UserClientModel.email, UserClientModel.pwd]
    let changeLoginData = this.postParamsCheck(ctx, params)
    let ctxRes = null
    return loginVali.checkLoginData(changeLoginData)
    .then(v => {
      return loginModel.changeLoginPwd(changeLoginData.email, changeLoginData.pwd)
      .then(v => {
        return succRes(LoginCodes.Reset_Pass_Succ, {})
      })
      .catch(e => {
        console.log(e)
        return serviceError()
      })
    })
    .catch(e => {
      console.log(e)
      return errorRes(LoginCodes.Login_IllegalData)
    })

  }

  // 通过用户addr查询用户经纬度
  getUserInfoByAddr (addr) {
    let ctxRes = null
    return loginModel.getUserInfoByAddr(addr)
    .then(v => {
      return succRes('getUserInfoByAddr', v)
    })
    .catch(e => {
      console.log(e)
      return serviceError()
    })
  }

  getUserInfoByAddr (addr) {
    return loginModel.queryUserByAdde(addr)
    .then(v => {
      return v[0]
    })
    .catch(e => {
      return e
    })
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
