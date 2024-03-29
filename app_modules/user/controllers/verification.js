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

/**
 * @namespace -User-Verifications-Controller-
 * @description In this Controller verification based functionality exist
 */

/**
 * @memberof -User-Verifications-Controller-
 * @name generateEmailVerificationCode
 * @path {POST} /users/verification/email
 * @description Bussiness Logic :- This API generate email verification code by user Id
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than code generate and send successfully
 * @author Danish Galiyara May 19th May, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const generateEmailVerificationCode = (req, res) => {
  __logger.info('generateEmailVerificationCode::')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      __logger.info('data:: then 1', { data })
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      if (data && data.email_verified) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.EMAIL_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      __logger.info('data:: then 2', { data })
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

/**
 * @memberof -User-Verifications-Controller-
 * @name GenerateSmsVerificationCode
 * @path {POST} /users/verification/sms
 * @description Bussiness Logic :- This API generate SMS verification code by user Id
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than code generate and send successfully
 * @author Danish Galiyara May 19th May, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const generateSmsVerificationCode = (req, res) => {
  __logger.info('generateSmsVerificationCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let firstName = ''
  let phoneNumber = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      __logger.info('data:: then 1', data)
      firstName = data && data.first_name ? data.first_name : ''
      phoneNumber = data && data.contact_number && data.phone_code ? data.phone_code + data.contact_number : ''
      if (data && data.phone_verified) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PHONE_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      __logger.info('data:: then 2', data)
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

/**
 * @memberof -User-Verifications-Controller-
 * @name ValidateEmailVerificationCode
 * @path {PATCH} /users/verification/email
 * @description Bussiness Logic :- This APi is use to validate the code received from email.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/verification/validateEmailCode|ValidateEmailVerificationCode}
 * @body {string}  code=1234 - Enter the valid code
 * @code {200} if the msg is success than verification successfully done.
 * @author Danish Galiyara 19th May, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */
const validateEmailVerificationCode = (req, res) => {
  __logger.info('validateEmailVerificationCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __constants.VERIFICATION_CHANNEL.email.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      __logger.info('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __constants.VERIFICATION_CHANNEL.email.name)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.email.name))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_VERIFIED, data: {} }))
    .catch(err => {
      __logger.info(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

/**
 * @memberof -User-Verifications-Controller-
 * @name ValidateSmsVerificationCode
 * @path {PATCH} /users/verification/sms
 * @description Bussiness Logic :- This API is used to validate code sent on registered phone number.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/verification/validateSmsCode|ValidateSmsVerificationCode}
 * @body {string}  code=1234 - Enter the valid code
 * @code {200} if the msg is success than verification successfully done.
 * @author Danish Galiyara 19th May, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */
const validateSmsVerificationCode = (req, res) => {
  __logger.info('validateSmsVerificationCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'string' || !req.body.code.match(__constants.VALIDATOR.number)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type string with only numeric characters'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __constants.VERIFICATION_CHANNEL.sms.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      // __logger.info('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __constants.VERIFICATION_CHANNEL.sms.name)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.sms.name))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.PHONE_VERIFIED, data: {} }))
    .catch(err => {
      __logger.info(err.err)
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateEmailOtpCode = (req, res) => {
  __logger.info('generateEmailOtpCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  let firstName = ''
  let email = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name)
    .then(data => {
      __logger.info('data:: then 1', data)
      firstName = data && data.first_name ? data.first_name : ''
      email = data && data.email ? data.email : ''
      return data
    })
    .then(data => {
      __logger.info('data:: then 2', data)
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.emailTfa.name, __constants.VERIFICATION_CHANNEL.emailTfa.expiresIn, __constants.VERIFICATION_CHANNEL.emailTfa.codeLength))
    .then(data => {
      __logger.info('data:: then 3', data)
      verificationService.sendOtpByEmail(data.code, email, firstName)
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.EMAIL_OTP, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const generateSmsOtpCode = (req, res) => {
  __logger.info('generateSmsOtpCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  let firstName = ''
  let phoneNumber = ''
  verificationService.getVerifiedAndCodeDataByUserId(userId, __constants.VERIFICATION_CHANNEL.smsTfa.name)
    .then(data => {
      __logger.info('then 1', { data })
      firstName = data && data.first_name ? data.first_name : ''
      phoneNumber = data && data.contact_number && data.phone_code ? data.phone_code + data.contact_number : ''
      return data
    })
    .then(data => {
      __logger.info('then 3', { data })
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

/**
 * @memberof -User-Verifications-Controller-
 * @name SendOtpCode
 * @path {POST} /users/otp
 * @description Bussiness Logic :- This API use to send the otp code to the user.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {string}  userId=5ba82a3f-5d76-416e-8cf5-b85388e2a99a - Enter the valid userId
 * @code {200} if the msg is success than the otp code is send to the user.
 * @author Danish Galiyara 20th September, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const sendOtpCode = (req, res) => {
  __logger.info('sendOtpCode::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: {} })
  }
  verificationService.getTfaData(userId)
    .then(data => {
      __logger.info('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
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
      __logger.info('[[[[[[[[[[[[[[[[[[[[', url)
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
        return http.Post({ userId }, 'body', url, { Authorization: __config.authTokens[0], 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT })
      }
    })
    .then(data => res.send(data.body || {}))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

/**
 * @memberof -User-Verifications-Controller-
 * @name ValidateTFa
 * @path {PATCH} /users/otp
 * @description Bussiness Logic :- This APi is use to validate code sent to the user
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/2FA/validateTFa|ValidateTFa}
 * @body {string}  code=1234 - Enter the valid code
 * @body {string}  userId=1234 - Enter the userId
 * @response {string} metadata.data.token  - If msg is success than return the token in response.
 * @code {200} if the msg is success than verification successfully done and return token in reponse.
 * @author Danish Galiyara 20th September, 2020
 * *** Last-Updated :- Arjun Bhole 23th October, 2020 ***
 */

const validateTFa = (req, res) => {
  __logger.info('validateTFa::>>>>>>..')
  const verificationService = new VerificationService()
  const userId = req.body && req.body.userId ? req.body.userId : '0'
  let backupData = {}
  let isTemp = false
  let dbData = {}
  if (!req.body || !req.body.code || typeof req.body.code !== 'string' || !req.body.code.match(__constants.VALIDATOR.number)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type string with only numeric characters'] })
  }
  if (!userId || userId === '0') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
  }
  let channelName = ''
  verificationService.getTfaData(userId)
    .then(data => {
      dbData = data
      __logger.info('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
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
      __logger.info('[[[[[[[[[[[[[[[[[[[[', channelName)
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
      __logger.info('heyyyyyyyyyyyyyyyyyy', { data })
      if (data.isAuthenticatorOtpValid) {
        return data
      } else {
        const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
        const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
        // __logger.info('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
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
      __logger.info('ooyyyyyyyyyyyyyyyyyy', { data })
      backupData = data
      const userService = new UserService()
      return userService.checkUserIdExistsForAccountProfile(userId)
    })
    .then(userData => {
      __logger.info('heyyyyyyyyyyyyyyyyyy', { userData })
      const payload = {
        user_id: userId,
        providerId: userData && userData.rows && userData.rows[0] && userData.rows[0].serviceProviderId ? userData.rows[0].serviceProviderId : '',
        wabaPhoneNumber: userData && userData.rows && userData.rows[0] && userData.rows[0].wabaPhoneNumber ? userData.rows[0].wabaPhoneNumber : '',
        maxTpsToProvider: userData && userData.rows && userData.rows[0] && userData.rows[0].maxTpsToProvider ? userData.rows[0].maxTpsToProvider : 10
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
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const addTempTfaDataBS = reqBody => {
  __logger.info('addTempTfaDataBS::>>>>>>..')
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
      __logger.info('aaaaaaaaaaaaaaaaaaaaaaaaaaa', { data })
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
      __logger.info('[[[[[[[[[[[[[[[[[[[[', url)
      if (!url) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_TFA_TYPE, data: {} })
      }
      if (url === 1) {
        return verificationService.generateAuthenticatorQrcode(__constants.TFA_AUTHENTICATOR_LABEL, authenticatorSecret)
      } else {
        const http = new HttpService(60000)
        return http.Post({ userId }, 'body', url, { Authorization: __config.authTokens[0], 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT })
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
      __logger.error('error: ', err)
      return dataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
  return dataAdded.promise
}

/**
 * @memberof -User-Verifications-Controller-
 * @name AddTempTfaData
 * @path {POST} /users/tfa
 * @description Bussiness Logic :- API to send otp code to user on their newly selected channel (send otp code to user on their newly selected channel)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/2FA/addTempTfaData|AddTempTfaData}
 * @body {string}  tfaType=authenticator - Enter new 2FA type here
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.qrcode  - It will return the qrcode and secret key.
 * @code {200} if the msg is success than it return success or already verified response
 status.
 * @author Danish Galiyara 2nd September, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const addTempTfaData = (req, res) => {
  __logger.info('addTempTfaData::>>>>>>..')
  req.body.userId = req.user && req.user.user_id ? req.user.user_id : '0'
  addTempTfaDataBS(req.body)
    .then(data => {
      delete data.userTfaId
      return res.send(data)
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateTempTfaBs = reqBody => {
  __logger.info('validateTempTfaBs::>>>>>>..')
  const dataAdded = q.defer()
  const verificationService = new VerificationService()
  const userId = reqBody && reqBody.userId ? reqBody.userId : '0'
  let channelName = ''
  let dbData = {}
  if (!reqBody || !reqBody.code || typeof reqBody.code !== 'string' || !reqBody.code.match(__constants.VALIDATOR.number)) {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type string with only numeric characters'] })
    return dataAdded.promise
  }
  if (!userId || userId === '0') {
    dataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, error: ['please provide userId of type string'] })
    return dataAdded.promise
  }
  verificationService.getTfaData(userId)
    .then(data => {
      dbData = data
      __logger.info('aaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
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
      __logger.info('[[[[[[[[[[[[[[[[[[[[', channelName)
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
        // __logger.info('datatat ===>', data, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
        if (moment(currentTime).isBefore(expireyTime)) {
          return verificationService.setTokenConsumed(userId, reqBody.code, channelName)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
        }
      }
    })
    .then(data => {
      __logger.info('code valid lets set temp as permenant', data)
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
      __logger.error('error: ', err)
      return dataAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
  return dataAdded.promise
}

/**
 * @memberof -User-Verifications-Controller-
 * @name ValidateTempTFa
 * @path {PATCH} /users/otp/new
 * @description Bussiness Logic :- API to validate code sent to the user on their newly selected channel.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/2FA/validateTempTFa|validateTempTFa}
 * @body {string}  code=34234
 * @body {string}  userId=1234567890
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data.backupCodes  - It will return a array of backup codes. <br/> sample :- [ { "code": 2000, "msg": "Success", "data": { "backupCodes": [ "f1c68a73-2acd-4930-a1c8-8297619026bd", "56c7107f-695c-4da8-9e14-680694d63a47", "7029ce06-1fec-4ef2-a67c-814295b98964", "3e659681-c4cc-4439-81cb-67b2a7128503", "aea5de74-6ae8-47d1-a630-7f656ec10c03" ] }, "error": null }]
 * @code {200} if the msg is success than it return the backup codes in response.
 * @author Danish Galiyara 21st September, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const validateTempTFa = (req, res) => {
  __logger.info('validateTempTFa::>>>>>>..')
  req.body.userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validateTempTfaBs(req.body)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

/**
 * @memberof -User-Verifications-Controller-
 * @name ValidateBackupCodeAndResetTfa
 * @path {PATCH} /users/otp/backup
 * @description Bussiness Logic :- API to validate user via backup code and reset tfa on success
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/2FA/validateBackupCodeAndResetTfa|ValidateBackupCodeAndResetTfa}
 * @body {string}  backupCode=sadsadsadasdawd232wadasd
 * @body {string}  userId=1234567890
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.token  - It will return a valid token
 * @code {200} if the msg is success than it resetTfaData and return token in response
 status.
 * @author Danish Galiyara 21st September, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const validateBackupCodeAndResetTfa = (req, res) => {
  __logger.info('validateBackupCodeAndResetTfa::>>>>>>..')
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
      __logger.info('data::>>>>>>.. then 1', data)
      if (!data[0].backupCodes.includes(req.body.backupCode)) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_BACKUP_CODE, err: {} })
      }
      return verificationService.resetTfaData(userId, data[0])
    })
    .then(data => {
      __logger.info('data::>>>>>>.. then 2')
      const userService = new UserService()
      return userService.checkUserIdExistsForAccountProfile(userId)
    })
    .then(userData => {
      __logger.info('userData::>>>>>>.. then 3')
      const payload = {
        user_id: userId,
        providerId: userData && userData.rows && userData.rows[0] && userData.rows[0].serviceProviderId ? userData.rows[0].serviceProviderId : '',
        wabaPhoneNumber: userData && userData.rows && userData.rows[0] && userData.rows[0].wabaPhoneNumber ? userData.rows[0].wabaPhoneNumber : '',
        maxTpsToProvider: userData && userData.rows && userData.rows[0] && userData.rows[0].maxTpsToProvider ? userData.rows[0].maxTpsToProvider : 10
      }
      const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.SESSION_TIME)
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { token, resetTfaData: true } })
    })
    .catch(err => {
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
