/**
	*	MYSQL userproductmanager 用户商品管理表
	*/

const UserProductManagerName = 'userproductmanager'

let UserProductManagerClientModel = {
	
}
let UserProductManagerServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	addr: {
    label: 'idx_addr',
    type: 'char(42)'
  },
	productId: {
		label: 'idx_productId',
		type: 'VARCHAR(20)'
	},
	userRealAddr: {
		label: 'userRealAddr',
		type: 'VARCHAR(40)'
	},
	userName: {
		label: 'userName',
		type: 'VARCHAR(20)'
	},
	userPhone: {
		label: 'userPhone',
		type: 'VARCHAR(20)'
	},
	express: {
		label: 'express',
		type: 'VARCHAR(20)'
	},
	expressId: {
		label: 'expressId',
		type: 'VARCHAR(40)'
	},
	state: {
		label: 'state',
		type: 'VARCHAR(10)'
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
  idx_productId: {
  	label: 'index(idx_productId)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}

module.exports = {
	UserProductManagerServerModel: UserProductManagerServerModel,
	UserProductManagerClientModel: UserProductManagerClientModel,
	UserProductManagerName: UserProductManagerName
}