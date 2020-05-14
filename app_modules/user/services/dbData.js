const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const __define = require('../../../config/define')
const ValidatonService = require('../services/validation')
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
    __db.postgresql.__query(queryProvider.getUserDetailsByEmail(), [email])
      .then(result => {
        // console.log('Qquery Result', results)
        if (result && result.rows && result.rows.length === 0) {
          userDetails.reject({ type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
        } else {
          userDetails.resolve(result.rows)
        }
      })
      .catch(err => {
        __logger.error('error in create user function: ', err)
        userDetails.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
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

  createUser (email, password, source) {
    const userCreated = q.defer()
    let userId = 0
    this.validate.signupService({ email, password, source })
      .then(valResponse => this.doesUserExists(email))
      .then(exists => {
        if (!exists) {
          userId = this.uniqueId.intId()
          const passwordSalt = passMgmt.genRandomString(16)
          const hashPassword = passMgmt.create_hash_of_password(password, passwordSalt).passwordHash
          return __db.postgresql.__query(queryProvider.createUser(), [email, hashPassword, userId, passwordSalt, source, userId])
        } else {
          return rejectionHandler({ type: __define.RESPONSE_MESSAGES.USER_EXIST, data: {} })
        }
      })
      .then(result => {
        // console.log('Qquery Result sign up', result)
        if (result && result.rowCount && result.rowCount > 0) {
          userCreated.resolve({ userId })
        } else {
          userCreated.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error in create user function: ', err)
        if (err.type) return userCreated.reject({ type: err.type, err: err.err })
        userCreated.reject({ type: __define.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return userCreated.promise
  }
}

module.exports = UserData
