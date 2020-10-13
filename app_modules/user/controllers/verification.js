const q = require('q')
const moment = require('moment')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const VerificationService = require('../services/verification')
const HttpService = require('../../../lib/http_service')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const _ = require('lodash')
const authMiddleware = require('../../../middlewares/auth/authentication')
const UserService = require('../services/dbData')

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
  if (!req.body || !req.body.code || typeof req.body.code !== 'string') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  if (!req.body.code.match(__constants.VALIDATOR.number)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Code provided in not valid'] })
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
      if (!data[0].tfaType && !data[0].tempTfaType) {
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
        case __constants.TFA_TYPE_ENUM[2]:
          url = 1
          break
        default:
          url = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', url)
      if (!url && data[0].tempTfaType) {
        switch (data[0].tempTfaType) {
          case __constants.TFA_TYPE_ENUM[0]:
            url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaSms
            break
          case __constants.TFA_TYPE_ENUM[1]:
            url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaEmail
            break
          default:
            url = null
        }
      }
      if (!url) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      if (url === 1) {
        const outJson = { body: { code: __constants.RESPONSE_MESSAGES.AUTHENTICATOR_CHECK_APP.code, msg: __constants.RESPONSE_MESSAGES.AUTHENTICATOR_CHECK_APP.message } }
        outJson.body.data = {}
        outJson.body.error = null
        delete outJson.body.status_code
        return outJson
      } else {
        const http = new HttpService(60000)
        return http.Post({ userId }, 'body', url, { Authorization: __config.authTokens[0] })
      }
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
  let backupData = {}
  let isTemp = false
  let dbData = {}
  if (!req.body || !req.body.code || typeof req.body.code !== 'string') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type string'] })
  }
  if (!req.body.code.match(__constants.VALIDATOR.number)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Code provided in not valid'] })
  }
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  let channelName = ''
  verificationService.getTfaData(userId)
    .then(data => {
      dbData = data
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      if (!data[0].tfaType && !data[0].tempTfaType) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      switch (data[0].tfaType) {
        case __constants.TFA_TYPE_ENUM[0]:
          channelName = __constants.VERIFICATION_CHANNEL.smsTfa.name
          break
        case __constants.TFA_TYPE_ENUM[1]:
          channelName = __constants.VERIFICATION_CHANNEL.emailTfa.name
          break
        case __constants.TFA_TYPE_ENUM[2]:
          channelName = 1
          break
        default:
          channelName = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', channelName)
      if (!channelName && data[0].tempTfaType) {
        isTemp = true
        switch (data[0].tempTfaType) {
          case __constants.TFA_TYPE_ENUM[0]:
            channelName = __constants.VERIFICATION_CHANNEL.smsTfa.name
            break
          case __constants.TFA_TYPE_ENUM[1]:
            channelName = __constants.VERIFICATION_CHANNEL.emailTfa.name
            break
          default:
            channelName = null
        }
      }
      if (!channelName) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      if (channelName === 1) {
        return verificationService.validateAuthenticatorOtp(data[0].authenticatorSecret, req.body.code)
      } else {
        return verificationService.getCodeDetails(userId, req.body.code, channelName)
      }
    })
    .then(data => {
      console.log('heyyyyyyyyyyyyyyyyyy', data)
      if (data.isAuthenticatorOtpValid) {
        return data
      } else {
        const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
        const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
        if (moment(currentTime).isBefore(expireyTime)) {
          return verificationService.setTokenConsumed(userId, req.body.code, channelName)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
        }
      }
    })
    .then(data => {
      if (isTemp) {
        const newData = {
          tfaType: dbData[0].tempTfaType
        }
        if (newData.tfaType && newData.tfaType === __constants.TFA_TYPE_ENUM[2]) newData.authenticatorSecret = dbData[0].tempAuthenticatorSecret
        return verificationService.updateTfaData(dbData[0].userTfaId, newData, dbData[0], userId)
      } else {
        return data
      }
    })
    .then(data => {
      backupData = data
      const userService = new UserService()
      return userService.checkUserIdExistsForAccountProfile(userId)
    })
    .then(userData => {
      const payload = {
        user_id: userId,
        providerId: userData && userData.rows && userData.rows[0] && userData.rows[0].serviceProviderId ? userData.rows[0].serviceProviderId : '',
        wabaPhoneNumber: userData && userData.rows && userData.rows[0] && userData.rows[0].wabaPhoneNumber ? userData.rows[0].wabaPhoneNumber : ''
      }
      const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.SESSION_TIME)
      const outData = { token }
      if (isTemp) {
        verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.email.name)
        outData.backupCodes = backupData.backupCodes
      }
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: outData })
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const addTempTfaDataBS = reqBody => {
  const dataAdded = q.defer()
  const verificationService = new VerificationService()
  const userId = reqBody && reqBody.userId ? reqBody.userId : '0'
  let dbData = {}
  let authenticatorSecret = null
  if (!userId || userId === '0') {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
    return dataAdded.promise
  }
  if (!reqBody.tfaType || typeof reqBody.tfaType !== 'string' || !__constants.TFA_TYPE_ENUM.includes(reqBody.tfaType)) {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please tfaType either of the following : ' + __constants.TFA_TYPE_ENUM.join(', ')] })
    return dataAdded.promise
  }
  if (reqBody.tfaType === __constants.TFA_TYPE_ENUM[2]) authenticatorSecret = verificationService.createSecretKey()
  verificationService.getTfaData(userId)
    .then(data => {
      dbData = data
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (!_.isEmpty(data)) {
        return verificationService.updateTempTfaData(userId, reqBody.tfaType, authenticatorSecret, data[0])
      }
      return verificationService.addTempTfaData(userId, reqBody.tfaType, authenticatorSecret)
    })
    .then(data => {
      if (_.isEmpty(dbData)) {
        const outJson = { body: __constants.RESPONSE_MESSAGES.SUCCESS }
        outJson.body.data = data
        outJson.body.error = null
        delete outJson.body.status_code
        return outJson
      }
      let url = ''
      switch (reqBody.tfaType) {
        case __constants.TFA_TYPE_ENUM[0]:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaSms
          break
        case __constants.TFA_TYPE_ENUM[1]:
          url = __config.base_url + __constants.INTERNAL_END_POINTS.sendOtpViaEmail
          break
        case __constants.TFA_TYPE_ENUM[2]:
          url = 1
          break
        default:
          url = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', url)
      if (!url) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      if (url === 1) {
        return verificationService.generateAuthenticatorQrcode(__constants.TFA_AUTHENTICATOR_LABEL, authenticatorSecret)
      } else {
        const http = new HttpService(60000)
        return http.Post({ userId }, 'body', url, { Authorization: __config.authTokens[0] })
      }
    })
    .then(data => {
      if (data && data.qrcode) {
        const outJson = { body: __constants.RESPONSE_MESSAGES.AUTHENTICATOR_QR_GENERATED }
        outJson.body.data = data
        outJson.body.error = null
        delete outJson.body.status_code
        return outJson
      }
      return data
    })
    .then(data => dataAdded.resolve(data.body || {}))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return dataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
  return dataAdded.promise
}

const addTempTfaData = (req, res) => {
  req.body.userId = req.user && req.user.user_id ? req.user.user_id : '0'
  addTempTfaDataBS(req.body)
    .then(data => {
      delete data.userTfaId
      return res.send(data)
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateTempTfaBs = reqBody => {
  const dataAdded = q.defer()
  const verificationService = new VerificationService()
  const userId = reqBody && reqBody.userId ? reqBody.userId : '0'
  let channelName = ''
  let dbData = {}
  if (!reqBody || !reqBody.code || typeof reqBody.code !== 'string') {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type string'] })
  }
  if (!reqBody.code.match(__constants.VALIDATOR.number)) {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Code provided is not valid'] })
  }
  if (!userId || userId === '0') {
    return dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      dbData = data
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      if (_.isEmpty(data)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TFA_NOT_SETTED_UP, data: {} })
      }
      if (!data[0] || !data[0].tempTfaType) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.TEMP_TFA_NOT_FOUND, data: {} })
      }
      switch (data[0].tempTfaType) {
        case __constants.TFA_TYPE_ENUM[0]:
          channelName = __constants.VERIFICATION_CHANNEL.smsTfa.name
          break
        case __constants.TFA_TYPE_ENUM[1]:
          channelName = __constants.VERIFICATION_CHANNEL.emailTfa.name
          break
        case __constants.TFA_TYPE_ENUM[2]:
          channelName = 1
          break
        default:
          channelName = null
      }
      console.log('[[[[[[[[[[[[[[[[[[[[', channelName)
      if (!channelName) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      if (channelName === 1) {
        return verificationService.validateAuthenticatorOtp(data[0].tempAuthenticatorSecret, reqBody.code)
      } else {
        return verificationService.getCodeDetails(userId, reqBody.code, channelName)
      }
    })
    .then(data => {
      if (data.isAuthenticatorOtpValid) {
        return data
      } else {
        const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
        const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        // console.log('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
        if (moment(currentTime).isBefore(expireyTime)) {
          return verificationService.setTokenConsumed(userId, reqBody.code, channelName)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
        }
      }
    })
    .then(data => {
      console.log('code valid lets set temp as permenant', data)
      const newData = {
        tfaType: dbData[0].tempTfaType
      }
      if (newData.tfaType && newData.tfaType === __constants.TFA_TYPE_ENUM[2]) newData.authenticatorSecret = dbData[0].tempAuthenticatorSecret
      return verificationService.updateTfaData(dbData[0].userTfaId, newData, dbData[0], userId)
    })
    .then(data => {
      delete data.userTfaId
      delete data.tfaType
      delete data.authenticatorSecret
      return dataAdded.resolve(data)
    })
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return dataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
  return dataAdded.promise
}

const validateTempTFa = (req, res) => {
  req.body.userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validateTempTfaBs(req.body)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      console.log(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateBackupCodeAndResetTfa = (req, res) => {
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!req.body || !req.body.backupCode || typeof req.body.backupCode !== 'string') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide backupCode of type string'] })
  }
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      if (!data[0].backupCodes.includes(req.body.backupCode)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_BACKUP_CODE, err: {} })
      }
      return verificationService.resetTfaData(userId, data[0])
    })
    .then(data => {
      const userService = new UserService()
      return userService.checkUserIdExistsForAccountProfile(userId)
    })
    .then(userData => {
      const payload = {
        user_id: userId,
        providerId: userData && userData.rows && userData.rows[0] && userData.rows[0].serviceProviderId ? userData.rows[0].serviceProviderId : '',
        wabaPhoneNumber: userData && userData.rows && userData.rows[0] && userData.rows[0].wabaPhoneNumber ? userData.rows[0].wabaPhoneNumber : ''
      }
      const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.SESSION_TIME)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { token, resetTfaData: true } })
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
  addTempTfaData,
  addTempTfaDataBS,
  validateTempTFa,
  validateBackupCodeAndResetTfa
}
