const moment = require('moment')
const VerificationService = require('../../user/services/verification')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')

const generateBusinessNumberVerificationCode = (req, res) => {
  __logger.info('API SEND SEND BUSINESS VERIFICATION CODE CALLED')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let businessName = ''
  let businessNumber = ''
  req.query.verificationChannel = req.query && req.query.verificationChannel ? req.query.verificationChannel.toLowerCase() : req.query.verificationChannel
  if (!req.query.verificationChannel || (req.query.verificationChannel !== 'sms' && req.query.verificationChannel !== 'voice')) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Verification channel not provided or invalid verification channel' })
  }
  verificationService.getVerifiedAndCodeDataByUserIdForBusinessNumber(userId)
    .then(data => {
      __logger.info('then 1', { data })
      businessName = data && data.business_name ? data.business_name : ''
      businessNumber = data && data.phone_code && data.phone_number ? data.phone_code + data.phone_number : ''
      if (data && data.phone_verified) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_PHONE_NUMBER_ALREADY_VERIFIED, err: {} })
      } else {
        return data
      }
    })
    .then(data => {
      __logger.info('then 2', { data })
      if (data && data.user_verification_code_id) {
        return verificationService.updateExistingTokens(userId, __constants.VERIFICATION_CHANNEL.businessNumber.name)
      } else {
        return data
      }
    })
    .then(data => verificationService.addVerificationCode(userId, __constants.VERIFICATION_CHANNEL.businessNumber.name, __constants.VERIFICATION_CHANNEL.businessNumber.expiresIn, __constants.VERIFICATION_CHANNEL.businessNumber.codeLength))
    .then(data => {
      __logger.info('then 4', { data })
      if (req.query.verificationChannel === 'sms') {
        return verificationService.sendVerificationCodeBySms(data.code, businessNumber, businessName)
      } else if (req.query.verificationChannel === 'voice') {
        return verificationService.sendVerificationCodeByVoice(data.code, businessNumber, businessName)
      }
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.BUSINESS_PHONE_VC, data: { code: data.code } }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

const validateBusinessNumberVerificationCode = (req, res) => {
  __logger.info('validateBusinessNumberVerificationCode::>>>>>>>>>>...')
  const verificationService = new VerificationService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (!req.body || !req.body.code || typeof req.body.code !== 'number') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: ['Please provide code of type integer'] })
  }
  verificationService.getCodeDetails(userId, req.body.code, __constants.VERIFICATION_CHANNEL.businessNumber.name)
    .then(data => {
      const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss')
      const expireyTime = moment(data.created_on).utc().add(+data.expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss')
      __logger.info('datatat ===>', { data }, expireyTime, currentTime, moment(currentTime).isBefore(expireyTime))
      if (moment(currentTime).isBefore(expireyTime)) {
        return verificationService.setTokenConsumed(userId, req.body.code, __constants.VERIFICATION_CHANNEL.businessNumber.name)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, err: {} })
      }
    })
    .then(data => verificationService.markChannelVerified(userId, __constants.VERIFICATION_CHANNEL.businessNumber.name))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.BUSINESS_PHONE_VERIFIED, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
    })
}

module.exports = { generateBusinessNumberVerificationCode, validateBusinessNumberVerificationCode }
