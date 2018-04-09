/*
	@type:
		- 'littleEth' : '0.00001 ETH'
		- 'baseEth': '0.000015 ETH'
		- 'normalEth': '0.000025 ETH'
		- 'moreEth': '0.0001ETH'
		- 'largeETH': '0.0002 ETH'
		- 'bamboo': '5'
*/

let LandProductClientModel = {
	longitude: 'longitude',
	latitude: 'latitude',
	type: 'type',
	value: 'value'
}
let LandProductServerModel = {
	longitude: {
		label: 'longitude',
		type: 'FLOAT'
	},
	latitude: {
		label: 'latitude',
		type: 'FLOAT'
	},
	type: {
		label: 'type',
		type: 'VARCHAR(10)'
	},
	value: {
		label: 'value',
		type: 'VARCHAR(20)'
	},
	other: {
		label: 'other',
		type: ')'
	}
}
module.exports = {
	LandProductServerModel: LandProductServerModel,
	LandProductClientModel:LandProductClientModel
}