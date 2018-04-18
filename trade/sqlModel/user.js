let UserClientModel = {
  id: 'id',
  addr: 'addr',
  email: 'email',
  pwd: 'pwd',
  tradePwd: 'tradePwd',
  state: 'state',
  longitude: 'longitude',
  latitude: 'latitude'
}
let UserServerModel = {
  id: {
    label: 'uid',
    type: 'INT AUTO_INCREMENT'
  },
  addr: {
    label: 'uaddr',
    type: 'VARCHAR(20)'
  },
  email: {
    label: 'uemail',
    type: 'VARCHAR(20)'
  },
  pwd: {
    label: 'upwd',
    type: 'VARCHAR(20)'
  },
  tradePwd: {
    label: 'utradePwd',
    type: 'VARCHAR(20)'
  },
  state: {
    label: 'ustate',
    type: 'VARCHAR(10)'
  },
  longitude: {
    label: 'longitude',
    type: 'FLOAT'
  },
  latitude: {
    label: 'latitude',
    type: 'FLOAT'
  },
  other: {
    label: 'other',
    type: 'PRIMARY KEY (uid))ENGINE=InnoDB DEFAULT CHARSET=utf8'
  }
}
module.exports = {
  UserClientModel: UserClientModel,
  UserServerModel: UserServerModel
}
