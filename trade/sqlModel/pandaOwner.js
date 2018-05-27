/**
	*	MYSQL pandaowner 熊猫信息表
	*/
const PandaOwnerName = 'pandaowner'

let PandaOwnerServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	gen: {
		label: 'uk_gen',
		type: 'char(30)'
	},
	addr: {
		label: 'idx_addr',
		type: 'char(42)'
	},
	type: {
		label: 'type',
		type: 'varchar(5)'
	},
	speed: {
		label: 'speed',
		type: 'decimal(4,2)'
	},
	hungry: {
		label: 'hungry',
		type: 'decimal(4,2)'
	},
	goldCatch: {
		label: 'goldCatch',
		type: 'decimal(4,2)'
	},
	waterCatch: {
		label: 'waterCatch',
		type: 'decimal(4,2)'
	},
	fireCatch: {
		label: 'fireCatch',
		type: 'decimal(4,2)'
	},
	earthCatch: {
		label: 'earthCatch',
		type: 'decimal(4,2)'
	},
	woodCatch: {
		label: 'woodCatch',
		type: 'decimal(4,2)'
	},
	special: {
		label: 'special',
		type: 'VARCHAR(20)'
	},
	integral: {
		label: 'integral',
		type: 'smallint unsigned'
	},
	state: {
		label: 'idx_state',
		type: 'VARCHAR(4)'
	},
	price: {
		label: 'price',
		type: 'int unsigned'
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
  idx_addr: {
    label: 'index (idx_addr),'
  },
  uk_gen: {
  	label: 'unique key(uk_gen),'
  },
  idx_state: {
  	label: 'index (idx_state)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
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
		type: 'valiAttr'
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

let AttrList = ['goldCatch', 'waterCatch', 'fireCatch', 'earthCatch', 'woodCatch']
module.exports = {
	PandaOwnerServerModel: PandaOwnerServerModel,
	PandaOwnerClientModel: PandaOwnerClientModel,
	AttrList: AttrList,
	PandaOwnerName: PandaOwnerName
}