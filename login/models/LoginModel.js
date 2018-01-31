const Db = require('./Db.js')
const db = new Db()

class LoginModel {
	// 查询数据库中所有数据
	async selectAllData () {
		let sql = 'SELECT * FROM user'
		let dataList = await db.query(sql)
		return dataList
	}
	
	// 查询评价数据
	async queryTagData (params) {
		// let sql = 'SELECT * FROM login WHERE Cid=' + params.Cid +
		// 	' AND Sid=' + params.Sid
		// let dataList = await db.query(sql)
		// return dataList
	}
}

module.exports = LoginModel
