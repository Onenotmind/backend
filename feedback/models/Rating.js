const Db = require('./Db.js')
const db = new Db()

class Rate {
	// 查询数据库中所有数据
	async selectAllData () {
		let sql = 'SELECT * FROM feedback'
		let dataList = await db.query(sql)
		return dataList
	}
	
	// 查询评价数据
	async queryTagData (params) {
		let sql = 'SELECT * FROM feedback WHERE Cid=' + params.Cid +
			' AND Sid=' + params.Sid
		let dataList = await db.query(sql)
		return dataList
	}
}

module.exports = Rate
