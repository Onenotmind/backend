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
  id: 'uid',
  addr: 'uaddr',
  email: 'uemail',
  pwd: 'upwd',
  tradePwd: 'utradePwd',
  state: 'ustate',
  longitude: 'longitude',
  latitude: 'latitude'
}
module.exports = {
  UserClientModel: UserClientModel,
  UserServerModel: UserServerModel
}
