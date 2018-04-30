
let AssetsValueClientModel = {
	
}
let AssetsValueServerModel = {
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
	AssetsValueServerModel: AssetsValueServerModel,
	AssetsValueClientModel: AssetsValueClientModel
}