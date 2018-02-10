/**
	{
		state: 0 || 1, // 0为正常返回
		res: {
			data: {}, // 正常返回数据
			state: 0 || 1,
			msg: ''
		},
		msg: ''
	}
*/

function resFormat (state, res, msg) {
	let res = {
		state: state,
		res: res,
		msg: msg
	}
	return res
}

module.exports = {
	resFormat: resFormat
}
