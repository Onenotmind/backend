
let BackPandaAssetsServerModel = {
	pandaGen: {
		label: 'pandaGen',
		type: 'VARCHAR(80)'
	},
	backAssets: {
		label: 'backAssets',
		type: 'VARCHAR(60)'
	},
	dropAssets: {
		label: 'dropAssets',
		type: 'VARCHAR(60)'
	},
	other: {
		label: 'other',
		type: 'PRIMARY KEY (pandaGen))ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}

let BackPandaAssetsClientModel = {
	
}

module.exports = {
	BackPandaAssetsServerModel: BackPandaAssetsServerModel,
	BackPandaAssetsClientModel:BackPandaAssetsClientModel
}