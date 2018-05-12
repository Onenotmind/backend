/**
	*	@mysql assetsvalue 商品价值表
	*/
const AssetsValueName = 'assetsvalue'
let AssetsValueClientModel = {
	
}
let AssetsValueServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
	productId: {
		label: 'uk_productId',
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
  uk_productId: {
  	label: 'unique key(uk_productId)'
  },
	other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}


module.exports = {
	AssetsValueServerModel: AssetsValueServerModel,
	AssetsValueClientModel: AssetsValueClientModel,
	AssetsValueName: AssetsValueName
}