const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { CommonCodes } = require('./msgCodes/StatusCodes.js')

function cacl (long, lati, rate, direction, hungry, speed) {
  let tmpWidth = 0
  let tmpHeight = 0
  if (direction === 'east') {
    tmpWidth = rate * (hungry / 100)
    tmpHeight = rate * (speed / 100)
    lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
  } else if (direction === 'west') {
    tmpWidth = rate * (hungry / 100)
    tmpHeight = rate * (speed / 100)
    lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else if (direction === 'north') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
  } else if (direction === 'south') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
  } else if (direction === 'northEast') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
  } else if (direction === 'northWest') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else if (direction === 'southEast') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
  } else if (direction === 'southWest') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else {}
  return {
    longitude: long,
    latitude: lati,
    width: tmpWidth,
    height: tmpHeight
  }
}


/**
  @公用方法：
    - 生成唯一标识id uuid
    - 封装GET请求的参数 getParamsCheck
    - 封装POST请求的参数 postParamsCheck
*/

function uuid (a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}

const cookieCryp = 'uuid'
function getParamsCheck (ctx, paramsArray) {
  return new Promise((resolve, reject) => {
    if (ctx.request.method !== 'GET') {
      reject(CommonCodes.Request_Method_Wrong)
    }
    let params = {}
    paramsArray.forEach((element) => {
      if (ctx.query[element] !== undefined) {
        params[element] = ctx.query[element]
      } else {
        reject(`参数${element}不存在！`)
      }
    })
    resolve(params)
  })
}

function postParamsCheck (ctx, paramsArray) {
  return new Promise((resolve, reject) => {
    if (ctx.request.method !== 'POST') {
      // ctx.body = '接口请求方式必须为POST'
      reject(CommonCodes.Request_Method_Wrong)
    }
    let requestData = ctx.request.body
    let params = {}
    paramsArray.forEach((element) => {
      if (requestData[element] !== undefined) {
        params[element] = requestData[element]
      } else {
        reject(`参数${element}不存在！`)
      }
    })
    resolve(params)
  })
}

function checkToken (token, addr) {
  return new Promise((resolve, reject) => {
    // let uuid = ctx.cookies.get('uuid')
    // let token = ctx.cookies.get('token')
    if (!token) reject(new Error('token is  null.'))
    jwt.verify(token, cookieCryp, function (err, decoded) {
      if (err) reject(new Error(err))
      if (decoded.uid !== addr) reject('token is out')
      resolve(decoded)
    })
  })
}

function geneToken (addr) {
  return jwt.sign({ uid: addr, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, cookieCryp)
}

function encrypt(str,secret){
  let cipher = crypto.createCipher('aes192',secret)
  let enc = cipher.update(str,'utf8','hex')
  enc += cipher.final('hex')
  return enc
}

function decrypt(str,secret){
  var decipher = crypto.createDecipher('aes192',secret)
  var dec = decipher.update(str,'hex','utf8')
  dec += decipher.final('utf8')
  return dec
}

function checkUserToken (ctx) {
  const token = ctx.request.headers['token']
  const checkAddr = ctx.cookies.get('userAddr')
  return checkToken(token, checkAddr)
}

module.exports = {
	cacl: cacl,
  uuid: uuid,
  getParamsCheck: getParamsCheck,
  postParamsCheck: postParamsCheck,
  encrypt: encrypt,
  decrypt: decrypt,
  checkToken: checkToken,
  geneToken: geneToken,
  checkUserToken: checkUserToken
}