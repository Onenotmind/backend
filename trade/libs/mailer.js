const nodemailer = require('nodemailer');

let config_email = {
  host: 'smtp.163.com',
  port: '465',
  secure: true,
  auth: {
    user: 'm15002832532@163.com',
    pass: 'CHENye8685800'
  }
}

// let config_email = {
//   host: 'smtp.mail.yahoo.com',
//   port: '465',
//   secure: true,
//   auth: {
//     user: 'chenye451@yahoo.com',
//     pass: 'cryeth8685800'
//   }
// }

let transporter = nodemailer.createTransport(config_email)

// let data = {
//   from: 'm15002832532@163.com',
//   to: 'chenye451@yahoo.com',
//   subject: 'title',
//   html: 'this is test emal'
// }

// transporter.sendMail(data, (err, info) => {
//   if (err) {
//     console.log('err',err)
//   } else {
//     console.log('Message sent', info.response)
//   }
// })

function sendCodeFromMail (to, code) {
  let data = {
    from: 'm15002832532@163.com',
    to: to,
    subject: 'Wunoland',
    html: '[Wunoland] Your Email Code Is: <b>' + code + '</b>'
  }
  return new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info.response)
      }
    })
  })
}

module.exports = {
  sendCodeFromMail: sendCodeFromMail
}