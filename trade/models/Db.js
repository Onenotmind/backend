const mysql = require('mysql')

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

  transQuery (connection, sql, val) {
    return new Promise((resolve, reject) => {
      connection.query(sql, val, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  testQuery () {
    return new Promise((resolve, reject) => {
      this.pool.getConnection(function (err, connection) {
        if (err) {
          reject(err)
        } else {
          connection.beginTransaction(function(err) {
            if (err) {reject(err)}
            connection.query(' update user set uaddr="123466" where uaddr=?', '12346', function (error, results, fields) {
              // connection.rollback(function() {
              // })
              // connection.release()
              resolve(results)
            })
          })
        }
      })
    })
  }
}

module.exports = Db
