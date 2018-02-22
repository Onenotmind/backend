let AssetsRollInClientModel = {
  orderId: 'orderId',
  addr: 'addr',
  assetsType: 'assetsType',
  amount: 'amount',
  state: 'state'
}
let AssetsRollInServerModel = {
  orderId: 'orderId',
  addr: 'uaddr',
  assetsType: 'uassetsType',
  amount: 'uamount',
  state: 'ustate'
}
module.exports = {
  AssetsRollInClientModel: AssetsRollInClientModel,
  AssetsRollInServerModel: AssetsRollInServerModel
}