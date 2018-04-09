const Joi = require('joi')

/**
	参数类型：
		@基因校验 valiPandaGeni
    @地址校验 valiAddr
    @属性值校验 valiAttr
    @邮箱校验 valiEmail
    @密码校验 valiPass
    @状态值校验 valiState
    @经纬度校验 valiTitude
	joi参数promise调用封装 joiDataCheck
*/
class JoiParamVali {

	async valiPandaGeni (geni) {
		const schema = Joi.string().alphanum().required().optional()
		await this.joiDataCheck(geni, schema)
	}

  async valiAddr (addr) {
    const schema = Joi.string().alphanum().required().optional()
    await this.joiDataCheck(addr, schema)
  }

  async valiAttr(attr) {
    const schema = Joi.number().min(0).max(100).precision(4).required().optional()
    await this.joiDataCheck(attr, schema)
  }

  async valiEmail (email) {
    const schema = Joi.string().email().required().optional()
    await this.joiDataCheck(email, schema)
  }

  async valiPass (pass) {
    const schema = Joi.string().alphanum().required().optional()
    await this.joiDataCheck(pass, schema)
  }

  async valiState (state, valiArr) {
    const schema = Joi.any().invalid(valiArr)
    await this.joiDataCheck(state, schema)
  }

  async valiTitude (titude) {
    const schema = Joi.number().min(-180).max(180).precision(2).required().optional()
    await this.joiDataCheck(titude, schema)
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
module.exports = JoiParamVali