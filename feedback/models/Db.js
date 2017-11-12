const mysql = require('mysql')

class Db {
	constructor () {
		this.config = {
			host: 'localhost',
			port: 3306,
			user: 'root',
			password: 'chenye8685800',
			database: 'feedback'
		}
		this.pool = mysql.createPool(this.config)
	}

	query (sql, value) {
		return new Promise((resolve, reject) => {
			this.pool.getConnection(function(err, connection) {
				if (err) {
					reject(err)
				} else {
					connection.query(sql, value, (err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows)
						}
						connection.release()
					})
				}
			})
		})
	}
}

module.exports = Db