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
    @商品属性校验 valiProductAttr
    @出行方向验证 valiDir
    @验证商品Id valiProductId
    @验证电话 valiPhone
	joi参数promise调用封装 joiDataCheck
*/
class JoiParamVali {

	async valiPandaGeni (geni) {
		const schema = Joi.string().alphanum().required().optional()
		return this.joiDataCheck(geni, schema)
	}

  async valiAddr (addr) {
    const schema = Joi.string().required().optional()
    return this.joiDataCheck(addr, schema)
  }

  async valiAttr(attr) {
    const schema = Joi.number().min(0).max(100).precision(4).required().optional()
    return this.joiDataCheck(attr, schema)
  }

  async valiBamboo(bamboo) {
    const schema = Joi.number().min(0).max(10000).required().optional()
    return this.joiDataCheck(bamboo, schema)
  }

  async valiEmail (email) {
    const schema = Joi.string().email().required().optional()
    return this.joiDataCheck(email, schema)
  }

  async valiPass (pass) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(pass, schema)
  }

  async valiState (state, valiArr) {
    const schema = Joi.any().invalid(valiArr)
    return this.joiDataCheck(state, schema)
  }

  async valiProductAttr (attr) {
    const AttrList = ['gold', 'water', 'fire', 'earth', 'wood']
    const schema = Joi.any().invalid(AttrList)
    return this.joiDataCheck(attr, schema)
  }

  async valiDir (direct) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(direct, schema)
  }

  async valiProductId (productId) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(productId, schema)
  }

  async valiTitude (titude) {
    const schema = Joi.number().min(-180).max(180).precision(2).required().optional()
    return this.joiDataCheck(titude, schema)
  }

  async valiPhone (phone) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(phone, schema)
  }

	// joi参数校验函数Promise封装
  joiDataCheck (params, dataFormat) {
    return new Promise((resolve, reject) => {
      Joi.validate(params, dataFormat, (err) => {
        if (err === null) {
          resolve(params)
        } else {
          console.log('参数校验失败', err)
          reject(new Error('参数校验失败'))
        }
      })
    })
  }
}
module.exports = JoiParamVali