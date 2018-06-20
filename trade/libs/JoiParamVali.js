const Joi = require('joi')
const { JoiCodes } = require('./msgCodes/StatusCodes.js')
/**
	参数类型：
		@基因校验 valiPandaGeni
    @地址校验 valiAddr
    @属性值校验 valiAttr
    @价钱校验 valiPrice
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
		const schema = Joi.string().length(30)
		return this.joiDataCheck(geni, schema, JoiCodes.Gen_Illegal)
	}

  async valiAddr (addr) {
    const schema = Joi.string().length(42)
    return this.joiDataCheck(addr, schema, JoiCodes.Addr_Illegal)
  }

  async valiAttr(attr) {
    const schema = Joi.number().min(0).max(100).precision(4).required().optional()
    return this.joiDataCheck(attr, schema, JoiCodes.Attr_Illegal)
  }

  async valiPrice (price) {
    const schema = Joi.number().min(0).max(20000).required().optional()
    return this.joiDataCheck(parseInt(price), schema, JoiCodes.Price_Illegal)
  }

  async valiBamboo(bamboo) {
    const schema = Joi.number().min(0).max(10000).required().optional()
    return this.joiDataCheck(parseInt(bamboo), schema, JoiCodes.Price_Illegal)
  }

  async valiEmail (email) {
    const schema = Joi.string().email().required().optional()
    return this.joiDataCheck(email, schema, JoiCodes.Email_Illegal)
  }

  async valiPass (pass) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(pass, schema, JoiCodes.Pwd_Illegal)
  }

  async valiState (state) {
    const AttrList = ['goldCatch', 'waterCatch', 'fireCatch', 'earthCatch', 'woodCatch']
    const schema = Joi.any().valid(valiArr)
    return this.joiDataCheck(state, schema, JoiCodes.State_Illegal)
  }

  async valiProductAttr (attr) {
    const AttrList = ['gold', 'water', 'fire', 'earth', 'wood']
    const schema = Joi.any().valid(AttrList)
    return this.joiDataCheck(attr, schema, JoiCodes.ProductAttr_Illegal)
  }

  async valiDir (direct) {
    const AttrList = ['west', 'east', 'north', 'south', 'southeast', 'southwest', 'northeast', 'northwest']
    const schema = Joi.any().valid(AttrList)
    return this.joiDataCheck(direct, schema, JoiCodes.Dir_Illegal)
  }

  async valiProductId (productId) {
    const schema = Joi.string().required().optional()
    return this.joiDataCheck(productId, schema, JoiCodes.ProductId_Illegal)
  }

  async valiTitude (titude) {
    const schema = Joi.number().min(-180).max(180).precision(2).required().optional()
    return this.joiDataCheck(titude, schema, JoiCodes.Titude_Illegal)
  }

  async valiPhone (phone) {
    const schema = Joi.string().alphanum().required().optional()
    return this.joiDataCheck(phone, schema, JoiCodes.Phone_Illegal)
  }

	// joi参数校验函数Promise封装
  joiDataCheck (params, dataFormat, codes) {
    return new Promise((resolve, reject) => {
      Joi.validate(params, dataFormat, (err) => {
        if (err === null) {
          resolve(params)
        } else {
          console.log('err', err)
          resolve(new Error(codes))
        }
      })
    })
  }
}
module.exports = JoiParamVali