const EthAddrManagerName = 'ethaddrmanager'

const EthAddrManagerServerModel = {
	id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
  addr: {
    label: 'uk_addr',
    type: 'char(42)'
  },
  private_key: {
  	label: 'private_key',
    type: 'varchar(100)'
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
  // 默认sql引擎设置
  other: {
    label: ' )ENGINE=InnoDB DEFAULT CHARSET=utf8'
  }
}

const EthAddrManagerClientModel = {
	}

module.exports = {
	EthAddrManagerName: EthAddrManagerName,
	EthAddrManagerClientModel: EthAddrManagerClientModel,
	EthAddrManagerServerModel: EthAddrManagerServerModel
}