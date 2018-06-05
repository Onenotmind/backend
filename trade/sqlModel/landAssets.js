/**
	*	MYSQL landassets 用户虚拟资产表
	*/
const LandAssetsName = 'landassets'

let LandAssetsServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	addr: {
    label: 'uk_addr',
    type: 'char(42)'
  },
	bamboo: {
		label: 'bamboo',
		type: 'int unsigned'
	},
	bambooLock: {
		label: 'bambooLock',
		type: 'int unsigned'
	},
	eth: {
		label: 'eth',
		type: 'decimal(6, 3)'
	},
	ethLock: {
		label: 'ethLock',
		type: 'decimal(6, 3)'
	},
	eos: {
		label: 'eos',
		type: 'decimal(7, 2)'
	},
	eosLock: {
		label: 'eosLock',
		type: 'decimal(7, 2)'
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
  uk_addr: {
    label: 'unique key(uk_addr)'
  },
	other: {
		label: ' )ENGINE=InnoDB DEFAULT CHARSET=utf8'
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
	LandAssetsServerModel: LandAssetsServerModel,
	LandAssetsName: LandAssetsName
}