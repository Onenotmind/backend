let UserClientModel = {
  id: 'id',
  addr: 'addr',
  email: 'email',
  pwd: 'pwd',
  tradePwd: 'tradePwd',
  state: 'state',
  longitude: 'longitude',
  latitude: 'latitude',
  invite: 'invite'
}
/**
  * MYSQL user 用户表
  */
let UserServerModel = {
  id: {
    label: 'pk_id',
    type: 'bigint(20) unsigned not null auto_increment'
  },
  addr: {
    label: 'uk_addr',
    type: 'char(42)'
  },
  email: {
    label: 'uk_email',
    type: 'varchar(30)'
  },
  phone: {
    label: 'uk_phone',
    type: 'varchar(15)'
  },
  pwd: {
    label: 'upwd',
    type: 'varchar(20)'
  },
  tradePwd: {
    label: 'utradePwd',
    type: 'varchar(20)'
  },
  state: {
    label: 'state',
    type: 'char(3)' // reg 注册 auth 已邮箱认证 
  },
  longitude: {
    label: 'longitude',
    type: 'decimal'
  },
  latitude: {
    label: 'latitude',
    type: 'decimal'
  },
  invite: {
    label: 'invite',
    type: 'char(42)'
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
    label: 'unique key(uk_addr),'
  },
  uk_email: {
    label: 'unique key(uk_email),'
  },
  uk_phone: {
    label: 'unique key(uk_phone),'
  },
  idx_invite: {
    label: 'index (invite)'
  },
  // 默认sql引擎设置
  other: {
    label: ' )ENGINE=InnoDB DEFAULT CHARSET=utf8'
  }
}

const UserModelName = 'user'

module.exports = {
  UserClientModel: UserClientModel,
  UserServerModel: UserServerModel,
  UserModelName: UserModelName
}
