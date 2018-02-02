const Joi = require('joi')

class LoginVali {
  // constructor () {
  // TODO
  // }

  // 验证注册数据是否合法
  checkRegisterData (params) {
    let registerData = Joi.object({
      email: Joi.string().email().required(),
      pwd: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
    })
    this.joiDataCheck(params, registerData)
  }

  // 验证登陆数据是否合法
  checkLoginData (params) {
    let loginData = Joi.object({
      email: Joi.string().email().required(),
      pwd: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/)
    })
    this.joiDataCheck(params, loginData)
  }

  // joi参数校验函数Promise封装
  joiDataCheck (params, dataFormat) {
    return new Promise((resolve, reject) => {
      Joi.validate(params, dataFormat, (err) => {
        if (err === null) {
          resolve()
        } else {
          reject(new Error('参数校验失败'))
        }
      })
    })
  }
}

module.exports = LoginVali
