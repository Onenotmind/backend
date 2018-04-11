let LandAssetsServerModel = {
	addr: {
		label: 'uaddr',
		type: 'VARCHAR(100)'
	},
	bamboo: {
		label: 'bamboo',
		type: 'FLOAT'
	},
	bamboolock: {
		label: 'bamboolock',
		type: 'FLOAT'
	},
	eth: {
		label: 'eth',
		type: 'FLOAT'
	},
	ethLock: {
		label: 'ethLock',
		type: 'FLOAT'
	},
	eos: {
		label: 'eos',
		type: 'FLOAT'
	},
	eosLock: {
		label: 'eosLock',
		type: 'FLOAT'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (uaddr))'
	}
}
let LandAssetsClientModel = {
	addr: 'uaddr',
	eth: 'eth',
	bamboo: 'bamboo',
	water: 'water'
}
module.exports = {
	LandAssetsClientModel: LandAssetsClientModel,
	LandAssetsServerModel: LandAssetsServerModel
}