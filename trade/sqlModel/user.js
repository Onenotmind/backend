let UserClientModel = {
  id: 'id',
  email: 'email',
  pwd: 'pwd',
  tradePwd: 'tradePwd',
  state: 'state'
}
let UserServerModel = {
  id: 'uid',
  email: 'uemail',
  pwd: 'upwd',
  tradePwd: 'utradePwd',
  state: 'ustate'
}
module.exports = {
  UserClientModel: UserClientModel,
  UserServerModel: UserServerModel
}
