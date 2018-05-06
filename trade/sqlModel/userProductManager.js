
let UserProductManagerClientModel = {
	
}
let UserProductManagerServerModel = {
	userAddr: {
		label: 'userAddr',
		type: 'VARCHAR(60),'
	},
	productId: {
		label: 'productId',
		type: 'VARCHAR(10),'
	},
	userRealAddr: {
		label: 'userRealAddr',
		type: 'VARCHAR(20),'
	},
	userName: {
		label: 'userName',
		type: 'VARCHAR(20),'
	},
	userPhone: {
		label: 'userPhone',
		type: 'VARCHAR(20),'
	},
	express: {
		label: 'express',
		type: 'VARCHAR(20),'
	},
	expressId: {
		label: 'expressId',
		type: 'VARCHAR(40),'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
	},
	other: {
		label: 'other',
		type: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}
module.exports = {
	UserProductManagerServerModel: UserProductManagerServerModel,
	UserProductManagerClientModel: UserProductManagerClientModel
}