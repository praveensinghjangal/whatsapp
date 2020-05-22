const moment = require('moment')
const __util = require('../../../lib/util')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const VerificationService = require('../services/verification')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

const generateEmailVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __define.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      if (data && data.email_verified) {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __define.VERIFICATION_CHANNEL.email.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __define.VERIFICATION_CHANNEL.email.name, __define.VERIFICATION_CHANNEL.email.expiresIn, __define.VERIFICATION_CHANNEL.email.codeLength))
    .then(data => verificationService.sendVerificationCodeByEmail(data.code, email, firstName))
    .then(data => __util.send(res, { type: __define.RESPONSE_MESSAGES.EMAIL_VC, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateSmsVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let phoneNumber = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __define.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      phoneNumber = data && data.contact_number && data.phone_code ? data.phone_code + data.contact_number : ''
      if (data && data.phone_verified) {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.PHONE_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __define.VERIFICATION_CHANNEL.sms.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __define.VERIFICATION_CHANNEL.sms.name, __define.VERIFICATION_CHANNEL.sms.expiresIn, __define.VERIFICATION_CHANNEL.sms.codeLength))
    .then(data => verificationService.sendVerificationCodeBySms(data.code, phoneNumber, firstName))
    .then(data => __util.send(res, { type: __define.RESPONSE_MESSAGES.PHONE_VC, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateEmailVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __define.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __define.VERIFICATION_CHANNEL.email.name)
      } else {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __define.VERIFICATION_CHANNEL.email.name))
    .then(data => __util.send(res, { type: __define.RESPONSE_MESSAGES.EMAIL_VERIFIED, data: {} }))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateSmsVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __define.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __define.VERIFICATION_CHANNEL.sms.name)
      } else {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __define.VERIFICATION_CHANNEL.sms.name))
    .then(data => __util.send(res, { type: __define.RESPONSE_MESSAGES.PHONE_VERIFIED, data: {} }))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = { generateEmailVerificationCode, generateSmsVerificationCode, validateEmailVerificationCode, validateSmsVerificationCode }
