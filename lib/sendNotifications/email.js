const q = require('q')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const __constants = require('../../config/constants')

class Emailer {
  constructor (configObj) {
    this.transporter = nodemailer.createTransport({
      // host: configObj.host,
      // port: configObj.port,
      // secure: false, // use TLS
      // tls: {
      //     // do not fail on invalid certs
      //     rejectUnauthorized: false
      // }
      service: 'gmail',
      auth: {
        user: 'gopalkrishna.kothari@vivaconnect.co',
        pass: 'pdloodtwpuxndqxg'
      }
    })
    // this.transporter = nodemailer.createTransport(smtpTransport({
    //   service: configObj.service,
    //   host: configObj.host,
    //   port: configObj.port,
    //   auth: {
    //     user: configObj.auth.user,
    //     pass: configObj.auth.password
    //   },
    //   tls: configObj.tls,
    //   debug: configObj.debug
    // }))
    this.fromEmail = configObj.fromEmail
    this.sendEmailFlag = configObj.sendEmail
  }

  sendEmail (toEmail, subject, html) {
    const emailSent = q.defer()
    if (!this.sendEmailFlag) {
      emailSent.resolve({ emailSent: true })
      return emailSent.promise
    }
    const options = {
      from: this.fromEmail,
      to: toEmail,
      subject: subject,
      html: html
    }
    this.transporter.sendMail(options, (error, info) => {
      if (error) {
        emailSent.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error })
        return emailSent.promise
      }
      emailSent.resolve({ emailSent: true })
    })
    return emailSent.promise
  }
}
module.exports = Emailer
