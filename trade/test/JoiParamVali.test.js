const JoiParamVali = require('../libs/JoiParamVali.js')
const joiParamVali = new JoiParamVali()
const chai = require('chai')
const _ = require('lodash')
chai.should()

// describe('geni', () => {
// 	it('geni vali', async () => {
// 		const geniVali = await joiParamVali.valiPandaGeni('0x1234')
// 		const res = _.isError(geniVali)
// 		res.should.equal(false)
// 	})
// })

describe('state', () => {
	it('state vali', async () => {
		const stateVali = await joiParamVali.valiState('state')
		console.log('stateVali')
	})
})
