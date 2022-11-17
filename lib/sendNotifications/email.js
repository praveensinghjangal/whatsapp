const q = require('q')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const __constants = require('../../config/constants')

class Emailer {
  constructor (configObj) {
    // this.transporter = nodemailer.createTransport({
    //   host: configObj.host,
    //   port: configObj.port,
    //   auth: {
    //         user: configObj.auth.user,
    //         pass: configObj.auth.password
    //       },
    //   })
    this.transporter = nodemailer.createTransport(smtpTransport({
      service: configObj.service,
      host: configObj.host,
      port: configObj.port,
      auth: {
        user: configObj.auth.user,
        pass: configObj.auth.password
      },
      tls: configObj.tls,
      debug: configObj.debug
    }))
    this.fromEmail = configObj.fromEmail
    this.sendEmailFlag = configObj.sendEmail
  }

  sendEmail (toEmail, subject, html) {
    const emailSent = q.defer()
    //console.log('1111111111111111111111111111111111111111111111111111',html)
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
        console.log('22222222222222222222222222222222222222222222222',error)
        emailSent.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: error })
        return emailSent.promise
      }
   
      emailSent.resolve({ emailSent: true })
    })
    return emailSent.promise
  }
}
module.exports = Emailer
