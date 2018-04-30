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
	productId: {
		label: 'productId',
		type: 'VARCHAR(10)'
	},
	type: {
		label: 'type',
		type: 'VARCHAR(10)'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
	},
	time: {
		label: 'time',
		type: 'INT'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (productId))ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}
module.exports = {
	LandProductServerModel: LandProductServerModel,
	LandProductClientModel:LandProductClientModel
}