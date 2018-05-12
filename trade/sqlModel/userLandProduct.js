/**
	*	MYSQL userlandproduct 用户商品表
	*/
const UserLandProductName = 'userlandproduct'

let UserLandProductClientModel = {
	
}
let UserLandProductServerModel = {
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
		type: 'VARCHAR(10)'
	},
	value: {
		label: 'value',
		type: 'smallint unsigned'
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
  	label: 'index(idx_addr),'
  },
  idx_productId: {
  	label: 'index(idx_productId)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}

module.exports = {
	UserLandProductServerModel: UserLandProductServerModel,
	UserLandProductClientModel: UserLandProductClientModel,
	UserLandProductName: UserLandProductName
}