const mysql = require('mysql')
const async = require('async')
class Db {
  constructor () {
    this.config = {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'chenye8685800',
      database: 'trade'
    }
    this.pool = mysql.createPool(this.config)
  }

  query (sql, value) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection(function (err, connection) {
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

  startTransaction () {
    return new Promise((resolve, reject) => {
      this.pool.getConnection(function (err, connection) {
        if (err) {
          reject(err)
        } else {
          resolve(connection)
        }
      })
    })
  }

  transQuery(connection, sql, value) {
    return new Promise((resolve, reject) => {
      connection.query(sql, value, (err, rows) => {
        if (err) {
          connection.rollback(function () {
            connection.release()
          })
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

module.exports = Db
