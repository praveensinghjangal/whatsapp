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
        console.log('Qquery Result', result[0])
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
        console.log('Qquery Result sign up', result)
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
        if (result && result.length === 0) {
          doesUserIdExist.resolve({ rows: result.rows, exists: true })
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
          doesUserIdExist.resolve({ record: result.rows[0], exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesUserIdExist.resolve({ record: result.rows[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesUserIdExist.reject(false)
      })
    return doesUserIdExist.promise
  }
}

module.exports = UserData
