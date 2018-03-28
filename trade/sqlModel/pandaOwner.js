let PandaOwnerServerModel = {
	pandaGeni: {
		label: 'pandaGen',
		type: 'VARCHAR(60)'
	},
	ownerAddr: {
		label: 'ownerAddr',
		type: 'VARCHAR(40)'
	},
	type: {
		label: 'type',
		type: 'VARCHAR(20)'
	},
	speed: {
		label: 'speed',
		type: 'FLOAT'
	},
	hungry: {
		label: 'hungry',
		type: 'FLOAT'
	},
	goldCatch: {
		label: 'goldCatch',
		type: 'FLOAT'
	},
	waterCatch: {
		label: 'waterCatch',
		type: 'FLOAT'
	},
	fireCatch: {
		label: 'fireCatch',
		type: 'FLOAT'
	},
	earthCatch: {
		label: 'earthCatch',
		type: 'FLOAT'
	},
	woodCatch: {
		label: 'woodCatch',
		type: 'FLOAT'
	},
	special: {
		label: 'special',
		type: 'VARCHAR(20)'
	},
	integral: {
		label: 'integral',
		type: 'INT'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
	},
	price: {
		label: 'price',
		type: 'FLOAT'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (pandaGen))'
	}
}

let PandaOwnerClientModel = {
	pandaGeni: {
		label: 'pandaGen',
		type: 'valiPandaGeni'
	},
	ownerAddr: {
		label: 'ownerAddr',
		type: 'VARCHAR(40)'
	},
	type: {
		label: 'type',
		type: 'VARCHAR(20)'
	},
	speed: {
		label: 'speed',
		type: 'FLOAT'
	},
	hungry: {
		label: 'hungry',
		type: 'FLOAT'
	},
	goldCatch: {
		label: 'goldCatch',
		type: 'FLOAT'
	},
	waterCatch: {
		label: 'waterCatch',
		type: 'FLOAT'
	},
	fireCatch: {
		label: 'fireCatch',
		type: 'FLOAT'
	},
	earthCatch: {
		label: 'earthCatch',
		type: 'FLOAT'
	},
	woodCatch: {
		label: 'woodCatch',
		type: 'FLOAT'
	},
	special: {
		label: 'special',
		type: 'VARCHAR(20)'
	},
	integral: {
		label: 'integral',
		type: 'INT'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
	},
	price: {
		label: 'price',
		type: 'FLOAT'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (pandaGen))'
	}
}
module.exports = {
	PandaOwnerServerModel: PandaOwnerServerModel,
	PandaOwnerClientModel: PandaOwnerClientModel
}