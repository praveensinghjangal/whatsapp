const q = require('q')
const moment = require('moment')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const UserService = require('../services/dbData')
const ValidatonService = require('../services/validation')
const EmailService = require('../../../lib/sendNotifications/email')
const EmailTemplates = require('../../../lib/sendNotifications/emailTemplates')
const __config = require('../../../config')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const sendPasswordTokenByEmail = (token, email, firstName) => {
  const emailSent = q.defer()
  __logger.info('send ----------------->', token, email, firstName)
  if (!token || typeof token !== 'string') {
    emailSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide token of type string' })
    return emailSent.promise
  }
  if (!email || typeof email !== 'string') {
    emailSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide email of type string' })
    return emailSent.promise
  }
  const emailService = new EmailService(__config.emailProvider)
  const url = __config.adminPannelBaseUrl + __constants.ADMIN_PANNEL_ENDPOINTS.adminPannelResetPassword + ';token=' + token
  emailService.sendEmail([email], __config.emailProvider.subject.passwordReset, EmailTemplates.passwordReset(url, firstName))
    .then(data => emailSent.resolve(data))
    .catch(err => emailSent.reject(err))
  return emailSent.promise
}

const forgetPassword = (req, res) => {
  const userService = new UserService()
  const validate = new ValidatonService()
  let firstName = ''
  __logger.info('forget password called: ', req.body)
  validate.forgotPassword(req.body)
    .then(data => userService.getPasswordTokenByEmail(req.body.email))
    .then(data => {
      firstName = data.first_name || ''
      if (data && data.reset_password_token_id) {
        return userService.updateExistingPasswordTokens(data.user_id)
      } else {
        return data
      }
    })
    .then(data => userService.addPasswordToken(data.user_id, __constants.RESET_PASSWORD_TOKEN_EXPIREY_TIME))
    .then(data => sendPasswordTokenByEmail(data.token, req.body.email, firstName))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_FORGET_PASSWORD, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const changePassword = (req, res) => {
  const userService = new UserService()
  const validate = new ValidatonService()
  __logger.info('change password called: ', req.body)
  validate.changePassword(req.body)
    .then(data => userService.getTokenDetailsFromToken(req.body.token))
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      __logger.info('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return userService.updatePassword(data.user_id, req.body.newPassword)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_PASS_TOKEN, err: {} })
      }
    })
    .then(data => userService.setPasswordTokeConsumed(req.body.token, data.userId))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = { forgetPassword, changePassword }
