let AssetsRollOutClientModel = {
  orderId: 'orderId',
  addr: 'addr',
  assetsType: 'assetsType',
  amount: 'amount',
  state: 'state'
}
let AssetsRollOutServerModel = {
  orderId: 'orderId',
  addr: 'uaddr',
  assetsType: 'uassetsType',
  amount: 'uamount',
  state: 'ustate'
}
module.exports = {
  AssetsRollOutClientModel: AssetsRollOutClientModel,
  AssetsRollOutServerModel: AssetsRollOutServerModel
}