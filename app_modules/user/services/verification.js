const q = require('q')
const __constants = require('../../../config/constants')
const __db = require('../../../lib/db')
var __config = require('../../../config')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const EmailService = require('../../../lib/sendNotifications/email')
const EmailTemplates = require('../../../lib/sendNotifications/emailTemplates')

class VerificationService {
  constructor () {
    this.uniqueId = new UniqueId()
  }

  getVerifiedAndCodeDataByUserId (userId, verificationChannel) {
    const verificationData = q.defer()
    if (!userId || typeof userId !== 'string') {
      verificationData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return verificationData.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationData.promise
    }
    const query = queryProvider.getVerifiedAndCodeDataByUserId()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, verificationChannel])
      .then(result => {
        if (result && result.length === 0) {
          verificationData.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, data: {} })
        } else {
          verificationData.resolve(result[0])
        }
      })
      .catch(err => verificationData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationData.promise
  }

  addVerificationCode (userId, verificationChannel, expiresIn, codeLength) {
    const verificationDataAdded = q.defer()
    if (!userId || typeof userId !== 'string') {
      verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return verificationDataAdded.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationDataAdded.promise
    }
    if (!expiresIn || typeof expiresIn !== 'number') {
      verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide expiresIn of type integer' })
      return verificationDataAdded.promise
    }
    if (!codeLength || typeof codeLength !== 'number') {
      verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide codeLength of type integer' })
      return verificationDataAdded.promise
    }
    const query = queryProvider.addVerificationCode()
    const code = this.uniqueId.randomInt(codeLength)
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, code, verificationChannel, expiresIn, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          verificationDataAdded.resolve({ userId, code })
        } else {
          verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => verificationDataAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationDataAdded.promise
  }

  updateExistingTokens (userId, verificationChannel) {
    const verificationDataUpdated = q.defer()
    if (!userId || typeof userId !== 'string') {
      verificationDataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return verificationDataUpdated.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationDataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationDataUpdated.promise
    }
    const query = queryProvider.updateVerificationCode()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, verificationChannel])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          verificationDataUpdated.resolve({ userId })
        } else {
          verificationDataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => verificationDataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationDataUpdated.promise
  }

  sendVerificationCodeByEmail (code, email, firstName) {
    const emailSent = q.defer()
    if (!code || typeof code !== 'number') {
      emailSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return emailSent.promise
    }
    if (!email || typeof email !== 'string') {
      emailSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide email of type string' })
      return emailSent.promise
    }
    const emailService = new EmailService(__config.emailProvider)
    emailService.sendEmail([email], __config.emailProvider.subject.emailVerification, EmailTemplates.verificationCodeTemplate(code, firstName))
      .then(data => emailSent.resolve(data))
      .catch(err => emailSent.reject(err))
    return emailSent.promise
  }

  sendVerificationCodeBySms (code, phoneNumber, firstName) {
    const smsSent = q.defer()
    if (!code || typeof code !== 'number') {
      smsSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return smsSent.promise
    }
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      smsSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide phoneNumber of type string' })
      return smsSent.promise
    }
    smsSent.resolve({ code, phoneNumber, firstName })
    return smsSent.promise
  }

  getCodeDetails (userId, code, verificationChannel) {
    const codeData = q.defer()
    if (!userId || typeof userId !== 'string') {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return codeData.promise
    }
    if (!code || typeof code !== 'number') {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return codeData.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return codeData.promise
    }
    const query = queryProvider.getCodeData()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, code, verificationChannel])
      .then(result => {
        if (result && result.length === 0) {
          codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_VERIFICATION_CODE, data: {} })
        } else {
          codeData.resolve(result[0])
        }
      })
      .catch(err => codeData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return codeData.promise
  }

  setTokenConsumed (userId, code, verificationChannel) {
    const tokenMarkedConsumed = q.defer()
    if (!userId || typeof userId !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return tokenMarkedConsumed.promise
    }
    if (!code || typeof code !== 'number') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return tokenMarkedConsumed.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return tokenMarkedConsumed.promise
    }
    const query = queryProvider.setTokenConsumed()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, code, verificationChannel, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          tokenMarkedConsumed.resolve({ updated: true })
        } else {
          tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return tokenMarkedConsumed.promise
  }

  markChannelVerified (userId, verificationChannel) {
    const tokenMarkedConsumed = q.defer()
    if (!userId || typeof userId !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return tokenMarkedConsumed.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return tokenMarkedConsumed.promise
    }
    let query = queryProvider.setTokenConsumed()
    switch (verificationChannel) {
      case __constants.VERIFICATION_CHANNEL.email.name:
        query = queryProvider.markUserEmailVerified()
        break
      case __constants.VERIFICATION_CHANNEL.sms.name:
        query = queryProvider.markUserSmsVerified()
        break
      case __constants.VERIFICATION_CHANNEL.businessNumber.name:
        query = queryProvider.markbusinessNumberVerified()
        break
      default:
        query = false
    }
    if (!query) {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'verificationChannel not configured' })
      return tokenMarkedConsumed.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          tokenMarkedConsumed.resolve({ updated: true })
        } else {
          tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return tokenMarkedConsumed.promise
  }

  getVerifiedAndCodeDataByUserIdForBusinessNumber (userId) {
    const verificationData = q.defer()
    if (!userId || typeof userId !== 'string') {
      verificationData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return verificationData.promise
    }
    const query = queryProvider.getVerifiedAndCodeDataByUserIdForBusinessNumber()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, __constants.VERIFICATION_CHANNEL.businessNumber.name])
      .then(result => {
        if (result.length === 0) {
          verificationData.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, data: {} })
        } else {
          verificationData.resolve(result[0])
        }
      })
      .catch(err => verificationData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationData.promise
  }

  sendVerificationCodeByVoice (code, phoneNumber, firstName) {
    const voiceCallSent = q.defer()
    if (!code || typeof code !== 'number') {
      voiceCallSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return voiceCallSent.promise
    }
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      voiceCallSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide phoneNumber of type string' })
      return voiceCallSent.promise
    }
    voiceCallSent.resolve({ code, phoneNumber, firstName })
    return voiceCallSent.promise
  }
}

module.exports = VerificationService
