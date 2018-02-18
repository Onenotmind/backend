let AssetsClientModel = {
  id: 'id',
  addr: 'addr',
  eth: 'eth',
  eos: 'eos',
  ethLock: 'ethLock',
  eosLock: 'eosLock',
  ethState: 'ethState',
  eosState: 'eosState'
}
let AssetsServerModel = {
  id: 'uid',
  addr: 'uaddr',
  eth: 'ueth',
  eos: 'ueos',
  ethLock: 'uethLock',
  eosLock: 'ueosLock',
  ethState: 'uethState',
  eosState: 'ueosState'
}
module.exports = {
  AssetsClientModel: AssetsClientModel,
  AssetsServerModel: AssetsServerModel
}