const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const __constants = require('../../../config/constants')
const ValidatonService = require('./validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const passMgmt = require('../../../lib/util/password_mgmt')
const __logger = require('../../../lib/logger')

class UserData {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  getUSerDataByEmail (email) {
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserDetailsByEmail(), [email])
      .then(result => {
        // console.log('Qquery Result', result[0])
        if (result && result.length === 0) {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
        } else {
          userDetails.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('error in get user function: ', err)
        userDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return userDetails.promise
  }

  doesUserExists (email) {
    const doesExist = q.defer()
    this.getUSerDataByEmail(email)
      .then(data => doesExist.resolve(true))
      .catch(err => doesExist.resolve(false)) //eslint-disable-line
    return doesExist.promise
  }

  createUser (email, password, tncAccepted, source) {
    const userCreated = q.defer()
    let userId = 0
    this.validate.signupService({ email, password, tncAccepted, source })
      .then(valResponse => this.doesUserExists(email))
      .then(exists => {
        if (!exists) {
          userId = this.uniqueId.uuid()
          const passwordSalt = passMgmt.genRandomString(16)
          const hashPassword = passMgmt.create_hash_of_password(password, passwordSalt).passwordHash
          const accountTypeId = __constants.ACCOUNT_PLAN_TYPE.Prepaid
          const userRole = __constants.USER_ROLE_ID.admin
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.createUser(), [email, hashPassword, userId, passwordSalt, source, userId, tncAccepted, this.uniqueId.uuid(), accountTypeId, userRole])
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.USER_EXIST, data: {} })
        }
      })
      .then(result => {
        // console.log('Qquery Result sign up', result)
        __logger.info('Qquery Result sign up', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          userCreated.resolve({ userId })
        } else {
          userCreated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error in create user function: ', err)
        console.log(err)
        if (err.type) return userCreated.reject({ type: err.type, err: err.err })
        userCreated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return userCreated.promise
  }

  checkUserIdExistsForAccountProfile (userId) {
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        // console.log('Response', valResponse)
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
      })
      .then(result => {
        // console.log('Qquery Result checkUserExistByUserId', result)

        // if exist throw return true exist
        if (result && result.length > 0) {
          doesUserIdExist.resolve({ rows: result, exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesUserIdExist.resolve({ exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesUserIdExist.reject(false)
      })
    return doesUserIdExist.promise
  }

  checkUserIdExistForBusiness (userId) {
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        // console.log('Response', valResponse)
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
      })
      .then(result => {
        // console.log('Qquery Result checkUserExistByUserId', result)
        // if exist throw return true exist
        if (result && result.length === 0) {
          doesUserIdExist.resolve({ record: {}, exists: false })
        } else {
          // else return prmoise to continue the insertiono of data
          doesUserIdExist.resolve({ record: result[0], exists: true })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesUserIdExist.reject(false)
      })
    return doesUserIdExist.promise
  }

  checkIfApiKeyExists (apiKey) {
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdFromKey(), [apiKey])
      .then(result => {
        if (result && result.length === 0) {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
        } else {
          userDetails.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get user function: ', err)
        userDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return userDetails.promise
  }

  getPasswordTokenByEmail (email) {
    const passwordTokenData = q.defer()
    if (!email || typeof email !== 'string') {
      passwordTokenData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide email id of type string' })
      return passwordTokenData.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getPasswordTokenByEmail(), [email])
      .then(result => {
        if (result && result.length === 0) {
          passwordTokenData.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, data: {} })
        } else {
          passwordTokenData.resolve(result[0])
        }
      })
      .catch(err => passwordTokenData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return passwordTokenData.promise
  }

  updateExistingPasswordTokens (userId) {
    const existingPasswordTokenUpdated = q.defer()
    if (!userId || typeof userId !== 'string') {
      existingPasswordTokenUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return existingPasswordTokenUpdated.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateExistingPasswordTokens(), [userId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          existingPasswordTokenUpdated.resolve({ user_id: userId })
        } else {
          existingPasswordTokenUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => existingPasswordTokenUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return existingPasswordTokenUpdated.promise
  }

  addPasswordToken (userId, expiresIn) {
    const passwordTokenAdded = q.defer()
    if (!userId || typeof userId !== 'string') {
      passwordTokenAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return passwordTokenAdded.promise
    }
    if (!expiresIn || typeof expiresIn !== 'number') {
      passwordTokenAdded.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide expiresIn of type integer' })
      return passwordTokenAdded.promise
    }
    const token = this.uniqueId.uuid()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addPasswordToken(), [userId, token, expiresIn, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          passwordTokenAdded.resolve({ userId, token })
        } else {
          passwordTokenAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => passwordTokenAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return passwordTokenAdded.promise
  }

  getTokenDetailsFromToken (token) {
    const tokenDetails = q.defer()
    if (!token || typeof token !== 'string') {
      tokenDetails.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide token of type string' })
      return tokenDetails.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTokenDetailsFromToken(), [token])
      .then(result => {
        if (result && result.length === 0) {
          tokenDetails.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_PASS_TOKEN, data: {} })
        } else {
          tokenDetails.resolve(result[0])
        }
      })
      .catch(err => tokenDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return tokenDetails.promise
  }

  updatePassword (userId, newPassword) {
    const passwordUpdated = q.defer()
    if (!userId || typeof userId !== 'string') {
      passwordUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return passwordUpdated.promise
    }
    if (!newPassword || typeof newPassword !== 'string') {
      passwordUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide newPassword of type string' })
      return passwordUpdated.promise
    }
    const passwordSalt = passMgmt.genRandomString(16)
    const hashPassword = passMgmt.create_hash_of_password(newPassword, passwordSalt).passwordHash
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updatePassword(), [hashPassword, passwordSalt, userId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          passwordUpdated.resolve({ userId })
        } else {
          passwordUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => passwordUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return passwordUpdated.promise
  }

  setPasswordTokeConsumed (token, userId) {
    const passwordTokenConsumed = q.defer()
    if (!token || typeof token !== 'string') {
      passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide token of type string' })
      return passwordTokenConsumed.promise
    }
    if (!userId || typeof userId !== 'string') {
      passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return passwordTokenConsumed.promise
    }
    console.log('here to update ---------->', token, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setPasswordTokeConsumed(), [userId, userId, token])
      .then(result => {
        console.log('updated ------------->', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          passwordTokenConsumed.resolve({ token })
        } else {
          passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return passwordTokenConsumed.promise
  }

  getEmailAndFirstNameFromUserId (userId) {
    const userDataFetched = q.defer()
    if (!userId || typeof userId !== 'string') {
      userDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return userDataFetched.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getEmailAndFirstNameByUserId(), [userId])
      .then(result => {
        if (result && result.length === 0) {
          userDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, data: {} })
        } else {
          userDataFetched.resolve(result[0])
        }
      })
      .catch(err => userDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return userDataFetched.promise
  }
}

module.exports = UserData
