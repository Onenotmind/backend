/**
	* @MYSQL backpandaassets 熊猫携带商品表
	*/

const BackPandaAssetsName = 'backpandaassets'

let BackPandaAssetsServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	gen: {
		label: 'uk_gen',
		type: 'char(30)'
	},
	backAssets: {
		label: 'backAssets',
		type: 'VARCHAR(60)'
	},
	dropAssets: {
		label: 'dropAssets',
		type: 'VARCHAR(60)'
	},
	gmt_create: {
    label: 'gmt_create',
    type: 'datetime'
  },
  gmt_modified: {
    label: 'gmt_modified',
    type: 'datetime'
  },
	// 索引
	pk_id: {
    label: 'primary key(pk_id),'
  },
  uk_gen: {
  	label: 'unique key(uk_gen)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}

let BackPandaAssetsClientModel = {
	
}

module.exports = {
	BackPandaAssetsServerModel: BackPandaAssetsServerModel,
	BackPandaAssetsClientModel:BackPandaAssetsClientModel,
	BackPandaAssetsName: BackPandaAssetsName
}