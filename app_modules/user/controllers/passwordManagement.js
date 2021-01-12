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
const passMgmt = require('../../../lib/util/password_mgmt')

/**
 * @namespace -Password-Management-Controller-
 * @description Password management for Helo-Whatsapp Sign up API are placed here.
 */

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

/**
 * @memberof -Password-Management-Controller-
 * @name ForgetPassword
 * @path {POST} /users/auth/forgetpassword
 * @description Bussiness Logic :- If the User account password is forgot so /forgetpassword the API is used.
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/forgetPassword|ForgetPassword}
 * @body {string}  email=habc@gmail.com - Provide the valid email.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg - Based on the requested requestBody it can be among thses three option [Link to set new password has been sent on your registered email/No record found/User does not exist].
 * @author Danish Galiyara 2nd September, 2020
 * *** Last-Updated :- Danish Galiyara 2nd September, 2020 ***
 */

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

/**
 * @memberof -Password-Management-Controller-
 * @name ChangePassword
 * @path {POST} /users/auth/changepassword
 * @description Bussiness Logic :- This API is used to reset the password.
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/changePassword|ChangePassword}
 * @body {string}  newPassword=habc67 - Please provide the new password.
 * @body {string}  token=asdasdasdsadm - Please provide the valid token.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg - It will return Success if the password reset successfully or it will give error msg as Invalid token  if the token is not valid.
 * @author Danish Galiyara 2nd September, 2020
 * *** Last-Updated :- Danish Galiyara 2nd September, 2020 ***
 */

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

const resetPasssword = (req, res) => {
  __logger.info('resetPassword function called::', req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const userService = new UserService()
  const validate = new ValidatonService()
  validate.resetPassword(req.body)
    .then(data => userService.getPasswordByUserId(userId))
    .then(result => {
      __logger.info('result from db---', result)
      const hashPassword = passMgmt.create_hash_of_password(req.body.oldPassword, result.saltKey.toLowerCase())
      __logger.info('hash of oldPassword::', hashPassword)
      if (hashPassword.passwordHash !== result.hashPass.toLowerCase()) { // todo : use bcrypt
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
      }
      return userService.updatePassword(userId, req.body.newPassword)
    })
    .then(data => {
      __logger.info('updated password for userId::', data)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = { forgetPassword, changePassword, resetPasssword }
