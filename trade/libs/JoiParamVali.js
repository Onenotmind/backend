const Joi = require('joi')

/**
	参数类型：
		@pandaGeni valiPandaGeni
	joi参数promise调用封装 joiDataCheck
*/
class JoiParamVali {

	async valiPandaGeni (geni) {
		const schema = Joi.string().alphanum()
		await this.joiDataCheck(geni, schema)
	}

	// joi参数校验函数Promise封装
  joiDataCheck (params, dataFormat) {
    return new Promise((resolve, reject) => {
      Joi.validate(params, dataFormat, (err) => {
        if (err === null) {
          resolve()
        } else {
          reject(new Error('参数校验失败', err))
        }
      })
    })
  }
}
module.exports = JoiParamVali