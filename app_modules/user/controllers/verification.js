const moment = require('moment')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const VerificationService = require('../services/verification')
const HttpService = require('../../../lib/http_service')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const _ = require('lodash')
const authMiddleware = require('../../../middlewares/authentication')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

const generateEmailVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      if (data && data.email_verified) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.email.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.email.name, __constants.VERIFICATION_CHANNEL.email.expiresIn, __constants.VERIFICATION_CHANNEL.email.codeLength))
    .then(data => verificationService.sendVerificationCodeByEmail(data.code, email, firstName))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_VC, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateSmsVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let phoneNumber = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      phoneNumber = data && data.contact_number && data.phone_code ? data.phone_code + data.contact_number : ''
      if (data && data.phone_verified) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PHONE_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.sms.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.sms.name, __constants.VERIFICATION_CHANNEL.sms.expiresIn, __constants.VERIFICATION_CHANNEL.sms.codeLength))
    .then(data => verificationService.sendVerificationCodeBySms(data.code, phoneNumber, firstName))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.PHONE_VC, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateEmailVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __constants.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __constants.VERIFICATION_CHANNEL.email.name)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.email.name))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_VERIFIED, data: {} }))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateSmsVerificationCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __constants.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __constants.VERIFICATION_CHANNEL.sms.name)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.sms.name))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.PHONE_VERIFIED, data: {} }))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateEmailOtpCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      return data
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name, __constants.VERIFICATION_CHANNEL.emailTfa.expiresIn, __constants.VERIFICATION_CHANNEL.emailTfa.codeLength))
    .then(data => verificationService.sendOtpByEmail(data.code, email, firstName))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_OTP, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateSmsOtpCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  let firstName = ''
  let phoneNumber = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.smsTfa.name)
    .then(data => {
      firstName = data && data.first_name ? data.first_name : ''
      phoneNumber = data && data.contact_number && data.phone_code ? data.phone_code + data.contact_number : ''
      return data
    })
    .then(data => {
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.smsTfa.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.smsTfa.name, __constants.VERIFICATION_CHANNEL.smsTfa.expiresIn, __constants.VERIFICATION_CHANNEL.smsTfa.codeLength))
    .then(data => verificationService.sendOtpBySms(data.code, phoneNumber, firstName))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SMS_OTP, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const sendOtpCode = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      if (!data[0] || !data[0].tfaType) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      let url = ''
      switch (data[0].tfaType) {
        case __constants.TFA_TYPE_ENUM[0]:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaSms
          break
        case __constants.TFA_TYPE_ENUM[1]:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaEmail
          break
        // case  __constants.TFA_TYPE_ENUM[2]:
        // url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaSms
        // break
        default:
          url = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', url)
      if (!url) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      const http = new HttpService(60000)
      return http.Post({ userId }, 'body', url, { Authorization: __config.authTokens[0] })
    })
    .then(data => res.send(data.body || {}))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateTFa = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  let channelName = ''
  verificationService.getTfaData(userId)
    .then(data => {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      if (!data[0] || !data[0].tfaType) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      switch (data[0].tfaType) {
        case __constants.TFA_TYPE_ENUM[0]:
          channelName = __constants.VERIFICATION_CHANNEL.smsTfa.name
          break
        case __constants.TFA_TYPE_ENUM[1]:
          channelName = __constants.VERIFICATION_CHANNEL.emailTfa.name
          break
          // case  __constants.TFA_TYPE_ENUM[2]:
          // url = __constants.VERIFICATION_CHANNEL.authenticatorTfa.name
          // break
        default:
          channelName = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', channelName)
      if (!channelName) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      return verificationService.getCodeDetails(userId, req.body.code, channelName)
    })
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, channelName)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => {
      const payload = { user_id: userId }
      const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.SESSION_TIME)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { token } })
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const addTfaData = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (!_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_ALREADY_SETTED_UP, data: {} })
      }
      return verificationService.addTfaData(userId, __constants.TFA_TYPE_ENUM[1], null)
    })
    .then(data => {
      delete data.userTfaId
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const updateTfa = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body.tfaType || typeof req.body.tfaType !== 'string' || !__constants.TFA_TYPE_ENUM.includes(req.body.tfaType)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please tfaType either of the following : ' + __constants.TFA_TYPE_ENUM.join(', ')] })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      const uniqueId = new UniqueId()
      if (req.body.tfaType && req.body.tfaType === __constants.TFA_TYPE_ENUM[2]) req.body.authenticatorSecret = uniqueId.uuid()
      return verificationService.updateTfaData(data[0].userTfaId, req.body, data[0], userId)
    })
    .then(data => {
      delete data.userTfaId
      delete data.tfaType
      delete data.authenticatorSecret
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = {
  generateEmailVerificationCode,
  generateSmsVerificationCode,
  validateEmailVerificationCode,
  validateSmsVerificationCode,
  generateEmailOtpCode,
  generateSmsOtpCode,
  sendOtpCode,
  validateTFa,
  addTfaData,
  updateTfa
}
