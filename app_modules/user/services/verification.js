const q = require('q')
const __define = require('../../../config/define')
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
    if (!userId || typeof userId !== 'number') {
      verificationData.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type integer' })
      return verificationData.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationData.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationData.promise
    }
    const query = queryProvider.getVerifiedAndCodeDataByUserId()
    __db.postgresql.__query(query, [userId, verificationChannel])
      .then(result => {
        if (result && result.rows && result.rows.length === 0) {
          verificationData.reject({ type: __define.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, data: {} })
        } else {
          verificationData.resolve(result.rows[0])
        }
      })
      .catch(err => verificationData.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationData.promise
  }

  addVerificationCode (userId, verificationChannel, expiresIn, codeLength) {
    const verificationDataAdded = q.defer()
    if (!userId || typeof userId !== 'number') {
      verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type integer' })
      return verificationDataAdded.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationDataAdded.promise
    }
    if (!expiresIn || typeof expiresIn !== 'number') {
      verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide expiresIn of type integer' })
      return verificationDataAdded.promise
    }
    if (!codeLength || typeof codeLength !== 'number') {
      verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide codeLength of type integer' })
      return verificationDataAdded.promise
    }
    const query = queryProvider.addVerificationCode()
    const code = this.uniqueId.randomInt(codeLength)
    __db.postgresql.__query(query, [userId, code, verificationChannel, expiresIn, userId])
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
          verificationDataAdded.resolve({ userId, code })
        } else {
          verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => verificationDataAdded.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationDataAdded.promise
  }

  updateExistingTokens (userId, verificationChannel) {
    const verificationDataUpdated = q.defer()
    if (!userId || typeof userId !== 'number') {
      verificationDataUpdated.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type integer' })
      return verificationDataUpdated.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      verificationDataUpdated.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return verificationDataUpdated.promise
    }
    const query = queryProvider.updateVerificationCode()
    __db.postgresql.__query(query, [userId, verificationChannel])
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
          verificationDataUpdated.resolve({ userId })
        } else {
          verificationDataUpdated.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => verificationDataUpdated.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationDataUpdated.promise
  }

  sendVerificationCodeByEmail (code, email, firstName) {
    const emailSent = q.defer()
    if (!code || typeof code !== 'number') {
      emailSent.reject({ type: __define.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return emailSent.promise
    }
    const emailService = new EmailService(__config.emailProvider)
    emailService.sendEmail([email], __config.emailProvider.subject.emailVerification, EmailTemplates.verificationCodeTemplate(code, firstName))
      .then(data => emailSent.resolve(data))
      .catch(err => emailSent.reject(err))
    return emailSent.promise
  }
}

module.exports = VerificationService
