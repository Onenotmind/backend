let AssetsRollOutName = 'assetsrollout'

let AssetsRollOutClientModel = {
  orderId: 'orderId',
  addr: 'addr',
  assetsType: 'assetsType',
  amount: 'amount',
  state: 'state'
}
let AssetsRollOutServerModel = {
  id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
  addr: {
    label: 'idx_addr',
    type: 'char(42)'
  },
  receiver: {
    label: 'receiver',
    type: 'char(42)'
  },
  type: {
    label: 'assetsType',
    type: 'char(10)'
  },

  amount: {
    label: 'amount',
    type: 'decimal(10, 4)'
  },
  state: {
    label: 'state',
    type: 'char(10)'
  },
  gmt_create: {
    label: 'gmt_create',
    type: 'datetime'
  },
  gmt_modified: {
    label: 'gmt_modified',
    type: 'datetime'
  },
  pk_id: {
    label: 'primary key(pk_id),'
  },
  idx_addr: {
    label: 'index (idx_addr)'
  },
  // 默认sql引擎设置
  other: {
    label: ' )ENGINE=InnoDB DEFAULT CHARSET=utf8'
  }
}
module.exports = {
  AssetsRollOutClientModel: AssetsRollOutClientModel,
  AssetsRollOutServerModel: AssetsRollOutServerModel,
  AssetsRollOutName: AssetsRollOutName
}