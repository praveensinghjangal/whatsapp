const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __db = require('../../../lib/db')
var __config = require('../../../config')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const EmailService = require('../../../lib/sendNotifications/email')
const SmsService = require('../../../lib/sendNotifications/sms')
const emailTemplates = require('../../../lib/sendNotifications/emailTemplates')
const smsTemplates = require('../../../lib/sendNotifications/smsTemplates')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const QRCode = require('qrcode')
const speakeasy = require('speakeasy')

const generateBackupCodes = number => {
  const bc = []
  const uniqueId = new UniqueId()
  for (let i = 0; i < number; i++) {
    bc.push(uniqueId.uuid())
  }
  return bc
}

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
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [verificationChannel, userId])
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
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, userId, verificationChannel])
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

  sendVerificationCodeByEmail (code, email, firstName = '') {
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
    emailService.sendEmail([email], __config.emailProvider.subject.emailVerification, emailTemplates.verificationCodeTemplate(code, firstName))
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
    const smsService = new SmsService()
    smsService.webcpSend(smsTemplates.phoneVerification(code, firstName), phoneNumber)
      .then(data => smsSent.resolve(data))
      .catch(err => smsSent.reject(err))
    return smsSent.promise
  }

  getCodeDetails (userId, code, verificationChannel) {
    const codeData = q.defer()
    if (!userId || typeof userId !== 'string') {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return codeData.promise
    }
    if (!code || typeof code !== 'string') {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return codeData.promise
    }
    if (!code.match(__constants.VALIDATOR.number)) {
      codeData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Code provided is not valid' })
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
    if (!code || typeof code !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return tokenMarkedConsumed.promise
    }
    if (!code.match(__constants.VALIDATOR.number)) {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Code provided is not valid' })
      return tokenMarkedConsumed.promise
    }
    if (!verificationChannel || typeof verificationChannel !== 'string') {
      tokenMarkedConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide verificationChannel of type string' })
      return tokenMarkedConsumed.promise
    }
    const query = queryProvider.setTokenConsumed()
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [userId, userId, code, verificationChannel])
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
    let query = ''
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
          const entityName = verificationChannel === __constants.VERIFICATION_CHANNEL.businessNumber.name ? __constants.ENTITY_NAME.WABA_INFORMATION : __constants.ENTITY_NAME.USERS
          saveHistoryData({ userId, oldChannelUpdatedToTrue: verificationChannel }, entityName, userId, userId)
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
    __db.mysql.query(__constants.HW_MYSQL_NAME, query, [__constants.VERIFICATION_CHANNEL.businessNumber.name, userId])
      .then(result => {
        console.log('hettttttttttttttttttttttt', result, userId)
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

  sendOtpByEmail (code, email, firstName) {
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
    emailService.sendEmail([email], __config.emailProvider.subject.emailVerification, emailTemplates.emailTfa(code, firstName))
      .then(data => emailSent.resolve(data))
      .catch(err => emailSent.reject(err))
    return emailSent.promise
  }

  sendOtpBySms (code, phoneNumber, firstName = '') {
    const smsSent = q.defer()
    if (!code || typeof code !== 'number') {
      smsSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide code of type integer' })
      return smsSent.promise
    }
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      smsSent.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide phoneNumber of type string' })
      return smsSent.promise
    }
    const smsService = new SmsService()
    smsService.webcpSend(smsTemplates.smsTfa(code, firstName), phoneNumber)
      .then(data => smsSent.resolve(data))
      .catch(err => smsSent.reject(err))
    return smsSent.promise
  }

  getTfaData (userId) {
    const verificationData = q.defer()
    if (!userId || typeof userId !== 'string') {
      verificationData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return verificationData.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTfaData(), [userId])
      .then(result => verificationData.resolve(result))
      .catch(err => verificationData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return verificationData.promise
  }

  updateTfaData (userTfaId, newData, oldData, userId) {
    const dataUpdated = q.defer()
    // __logger.info('Inputs insertBusinessData userId', userId)
    saveHistoryData(oldData, __constants.ENTITY_NAME.USERS_TFA, userTfaId, userId)
    const tfaObject = {
      authenticatorSecret: newData.authenticatorSecret ? newData.authenticatorSecret : null,
      backupCodes: JSON.stringify(generateBackupCodes(__constants.TFA_BACKUP_CODES_AMOUNT)),
      tfaType: newData.tfaType ? newData.tfaType : oldData.tfaType
    }
    const queryParam = []
    _.each(tfaObject, (val, key) => queryParam.push(val))
    queryParam.push(userId)
    queryParam.push(userTfaId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTfaData(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          tfaObject.backupCodes = JSON.parse(tfaObject.backupCodes)
          dataUpdated.resolve(tfaObject)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        // __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  addTempTfaData (userId, tfaType, authenticatorSecret) {
    const tfaAdded = q.defer()
    if (!userId || typeof userId !== 'string') {
      tfaAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return tfaAdded.promise
    }
    if (authenticatorSecret && typeof authenticatorSecret !== 'string') {
      tfaAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide authenticatorSecret of type string' })
      return tfaAdded.promise
    }
    if (!tfaType || typeof tfaType !== 'string' || !__constants.TFA_TYPE_ENUM.includes(tfaType)) {
      tfaAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please tfaType either of the following : ' + __constants.TFA_TYPE_ENUM.join(', ') })
      return tfaAdded.promise
    }
    const userTfaId = this.uniqueId.uuid()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addTempTfaData(), [userTfaId, userId, authenticatorSecret || null, tfaType, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          tfaAdded.resolve({ userTfaId })
        } else {
          tfaAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => tfaAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return tfaAdded.promise
  }

  updateTempTfaData (userId, tfaType, authenticatorSecret, oldData) {
    const dataUpdated = q.defer()
    // __logger.info('Inputs insertBusinessData userId', userId)
    if (!userId || typeof userId !== 'string') {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return dataUpdated.promise
    }
    if (authenticatorSecret && typeof authenticatorSecret !== 'string') {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide authenticatorSecret of type string' })
      return dataUpdated.promise
    }
    if (!tfaType || typeof tfaType !== 'string' || !__constants.TFA_TYPE_ENUM.includes(tfaType)) {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please tfaType either of the following : ' + __constants.TFA_TYPE_ENUM.join(', ') })
      return dataUpdated.promise
    }
    saveHistoryData(oldData, __constants.ENTITY_NAME.USERS_TFA, oldData.userTfaId, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTempTfaData(), [authenticatorSecret, tfaType, userId, oldData.userTfaId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve({ userTfaId: oldData.userTfaId })
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        // __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  createSecretKey () {
    const { base32 } = speakeasy.generateSecret({ length: 20 })
    return base32
  }

  generateAuthenticatorQrcode (label, secretKey) {
    const authenticatorData = q.defer()
    const url = speakeasy.otpauthURL({ secret: secretKey, encoding: 'base32', label })
    QRCode.toDataURL(url, (err, qrcode) => {
      if (err) authenticatorData.reject({ type: __constants.RESPONSE_MESSAGES.QRCODE_GEN_ERR, err: err })
      authenticatorData.resolve({ qrcode, secret: secretKey })
    })
    return authenticatorData.promise
  }

  validateAuthenticatorOtp (secretKey, token) {
    const isValid = q.defer()
    isValid.resolve({
      isAuthenticatorOtpValid: speakeasy.totp.verify({
        secret: secretKey,
        encoding: 'base32',
        token: token
      })
    })
    return isValid.promise
  }

  resetTfaData (userId, oldData) {
    const dataUpdated = q.defer()
    // __logger.info('Inputs insertBusinessData userId', userId)
    if (!userId || typeof userId !== 'string') {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return dataUpdated.promise
    }
    saveHistoryData(oldData, __constants.ENTITY_NAME.USERS_TFA, oldData.userTfaId, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.resetTfaData(), [userId, oldData.userTfaId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve({ userTfaId: oldData.userTfaId })
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        // __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }
}

module.exports = VerificationService
