const Db = require('./Db.js')
const db = new Db()

class Rate {
	async selectAllData () {
		let sql = 'SELECT * FROM feedback'
		let dataList = await db.query(sql)
		return dataList
	}
	async getAllData () {
		let dataList = await this.selectAllData()
		console.log(dataList)
	}
}

module.exports = Rate
