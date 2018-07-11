const VoteListName = 'votelist'

const VoteListClientModel = {

}

const VoteListServerModel = {
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
  	type: 'varchar(20)'
  },
  attr: {
  	label: 'idx_attr',
  	type: 'varchar(10)'
  },
  period: {
  	label: 'idx_period',
  	type: 'smallint unsigned'
  },
  amount: {
    label: 'amount',
    type: 'int'
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
  	label: 'index (idx_productId),'
  },
  idx_period: {
  	label: 'index (idx_period)'
  },
  other: {
		label: ')ENGINE=InnoDB DEFAULT CHARSET=utf8'
	}
}

module.exports = {
	VoteListName: VoteListName,
	VoteListServerModel: VoteListServerModel,
	VoteListClientModel: VoteListClientModel
}