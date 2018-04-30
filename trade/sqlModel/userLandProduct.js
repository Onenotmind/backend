
let UserLandProductClientModel = {
	
}
let UserLandProductServerModel = {
	userAddr: {
		label: 'userAddr',
		type: 'VARCHAR(60),'
	},
	productId: {
		label: 'productId',
		type: 'VARCHAR(10),'
	},
	value: {
		label: 'value',
		type: 'VARCHAR(10)'
	},
	other: {
		label: 'other',
		type: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}
module.exports = {
	UserLandProductServerModel: UserLandProductServerModel,
	UserLandProductClientModel: UserLandProductClientModel
}