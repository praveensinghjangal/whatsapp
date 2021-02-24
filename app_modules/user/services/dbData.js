const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const __constants = require('../../../config/constants')
const ValidatonService = require('./validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const passMgmt = require('../../../lib/util/password_mgmt')
const __logger = require('../../../lib/logger')
const _ = require('lodash')
const AgreementStatusEngine = require('../services/status')

class UserData {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  getUSerDataByEmail (email) {
    __logger.info('getUSerDataByEmail>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserDetailsByEmail(), [email])
      .then(result => {
        __logger.info('Qquery Result', result[0])
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
    __logger.info('doesUserExists>>>')
    const doesExist = q.defer()
    this.getUSerDataByEmail(email)
      .then(data => doesExist.resolve(true))
      .catch(err => doesExist.resolve(false)) //eslint-disable-line
    return doesExist.promise
  }

  createUser (email, password, tncAccepted, source) {
    __logger.info('createUser>>>')
    const userCreated = q.defer()
    let userId = 0
    this.validate.signupService({ email, password, tncAccepted, source })
      .then(valResponse => this.doesUserExists(email))
      .then(exists => {
        __logger.info('exists>>> then 2')
        if (!exists) {
          userId = this.uniqueId.uuid()
          const passwordSalt = passMgmt.genRandomString(16)
          const hashPassword = passMgmt.create_hash_of_password(password, passwordSalt).passwordHash
          const accountTypeId = __constants.ACCOUNT_PLAN_TYPE.Postpaid
          const userRole = __constants.USER_ROLE_ID.admin
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.createUser(), [email, hashPassword, userId, passwordSalt, source, userId, tncAccepted, this.uniqueId.uuid(), accountTypeId, userRole])
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.USER_EXIST, data: {} })
        }
      })
      .then(result => {
        __logger.info('Qquery Result sign up then 3', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          userCreated.resolve({ userId })
        } else {
          userCreated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error in create user function: ', err)
        if (err.type) return userCreated.reject({ type: err.type, err: err.err })
        userCreated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return userCreated.promise
  }

  checkUserIdExistsForAccountProfile (userId) {
    __logger.info('checkUserIdExistsForAccountProfile>>>')
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        __logger.info('Response then 1', { valResponse })
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
      })
      .then(result => {
        __logger.info('then 2', { result })
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
    __logger.info('checkUserIdExistForBusiness>>>')
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        __logger.info('Response then 1', { valResponse })
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
      })
      .then(result => {
        __logger.info('result then 2', { result })
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
    __logger.info('checkIfApiKeyExists>>>>>>>>>>>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdFromKey(), [apiKey])
      .then(result => {
        __logger.info('result>>>>>>>>>>>>>', { result })
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
    __logger.info('getPasswordTokenByEmail>>>>>>>>>>>>>')
    const passwordTokenData = q.defer()
    if (!email || typeof email !== 'string') {
      passwordTokenData.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide email id of type string' })
      return passwordTokenData.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getPasswordTokenByEmail(), [email])
      .then(result => {
        __logger.info('result then 1', { result })
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
    __logger.info('updateExistingPasswordTokens>>>>>>>>>>>>>')
    const existingPasswordTokenUpdated = q.defer()
    if (!userId || typeof userId !== 'string') {
      existingPasswordTokenUpdated.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return existingPasswordTokenUpdated.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateExistingPasswordTokens(), [userId, userId])
      .then(result => {
        __logger.info('result then 1', { result })
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
    __logger.info('addPasswordToken>>>>>>>>>>>>>')
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
        __logger.info('result then 1', { result })
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
    __logger.info('getTokenDetailsFromToken>>>>>>>>>>>>>')
    const tokenDetails = q.defer()
    if (!token || typeof token !== 'string') {
      tokenDetails.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide token of type string' })
      return tokenDetails.promise
    }
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTokenDetailsFromToken(), [token])
      .then(result => {
        __logger.info('result then 1', { result })
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
    __logger.info('updatePassword>>>>>>>>>>>>>')
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
        __logger.info('result then 1', { result })
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
    __logger.info('setPasswordTokeConsumed>>>>>>>>>>>>>')
    const passwordTokenConsumed = q.defer()
    if (!token || typeof token !== 'string') {
      passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide token of type string' })
      return passwordTokenConsumed.promise
    }
    if (!userId || typeof userId !== 'string') {
      passwordTokenConsumed.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId of type string' })
      return passwordTokenConsumed.promise
    }
    __logger.info('here to update ---------->', token, userId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setPasswordTokeConsumed(), [userId, userId, token])
      .then(result => {
        __logger.info('updated ------------->', { result })
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

  getPasswordByUserId (userId) {
    __logger.info('getUSerDataByUserId>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getPasswordByUserId(), [userId])
      .then(result => {
        __logger.info('Qquery Result', result[0])
        if (result && result.length === 0) {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: {} })
        } else {
          userDetails.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get user function: ', err)
        userDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return userDetails.promise
  }

  getAccountProfileByUserId (userId) {
    __logger.info('getUSerDataByUserId>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
      .then(result => {
        __logger.info('Qquery Result', result[0])
        if (result && result.length === 0) {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else {
          userDetails.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get user details by userId function: ', err)
        userDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return userDetails.promise
  }

  getAccountProfileList (ItemsPerPage, offset) {
    __logger.info('getAccountProfileList>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAccountProfileList(), [ItemsPerPage, offset])
      .then(result => {
        __logger.info('Qquery Result')
        if (result && result.length === 0) {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else {
          userDetails.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('error in get account profile list function: ', err)
        userDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return userDetails.promise
  }

  updateAccountManagerName (accountManagerName, userId) {
    __logger.info('updateAccountManagerName>>>')
    const userDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAccountManagerName(), [accountManagerName, userId])
      .then(result => {
        __logger.info('Qquery Result', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          userDetails.resolve(result)
        } else {
          userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error in updateAccountManagerName function: ', err)
        userDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return userDetails.promise
  }

  getAgreementByStatusId (agreementStatus, ItemsPerPage, offset) {
    __logger.info('getAgreementByStatusId>>>')
    const userAgreement = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAgreementByStatusId(), [agreementStatus, ItemsPerPage, offset, agreementStatus])
      .then(result => {
        __logger.info('Qquery Result')
        if (result && result[0] && result[0].length === 0) {
          userAgreement.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else {
          userAgreement.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('error in getAgreementByStatusId function: ', err)
        userAgreement.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return userAgreement.promise
  }

  getAgreementInfoById (agreementId, userId) {
    __logger.info('getAgreementInfoById>>>')
    const userAgreement = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAgreementInfoById(), [agreementId, userId])
      .then(result => {
        __logger.info('Query Result')
        if (result && result.length === 0) {
          userAgreement.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
        } else {
          userAgreement.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in getAgreementInfoById function: ', err)
        userAgreement.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
      })
    return userAgreement.promise
  }

  getAgreementInfoByUserId (userId) {
    __logger.info('getAgreementInfoByUserId>>>')
    const userAgreement = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAgreementInfoByUserId(), [userId])
      .then(result => {
        __logger.info('Query Result')
        if (result && result.length === 0) {
          userAgreement.resolve()
        } else {
          userAgreement.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in getAgreementInfoByUserId function: ', err)
        userAgreement.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
      })
    return userAgreement.promise
  }

  insertAgreement (newData, userId, callerUserId) {
    __logger.info('Inserting agreement')
    const dataInserted = q.defer()
    const uniqueId = new UniqueId()
    const agreementStatusEngine = new AgreementStatusEngine()
    const agreementData = {
      user_agreement_files_id: uniqueId.uuid(),
      userId: userId,
      fileName: (newData && newData.fileName) ? newData.fileName : null,
      filePath: (newData && newData.filePath) ? newData.filePath : null,
      agreementStatusId: (newData && newData.agreementStatusId) ? newData.agreementStatusId : null,
      createdBy: callerUserId
    }
    const queryParam = []
    _.each(agreementData, (val) => queryParam.push(val))
    __logger.info('inserttttttttttttttttttttt->', agreementData, queryParam)
    if (agreementStatusEngine.canUpdateAgreementStatus(agreementData.agreementStatusId, __constants.AGREEMENT_STATUS.pendingForDownload.statusCode)) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.saveUserAgreement(), queryParam)
        .then(result => {
          __logger.info('result', { result })
          if (result && result.affectedRows && result.affectedRows > 0) {
            dataInserted.resolve(agreementData)
          } else {
            dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
          }
        })
        .catch(err => {
          __logger.error('error: ', err)
          dataInserted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
        })
    } else {
      dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.AGREEMENT_STATUS_CANNOT_BE_UPDATED, data: {} })
    }
    return dataInserted.promise
  }

  updateAgreement (newData, oldData, userId, callerUserId) {
    __logger.info('Updating agreement')
    const dataUpdated = q.defer()
    const agreementStatusEngine = new AgreementStatusEngine()
    const agreementData = {
      fileName: newData.fileName ? newData.fileName : oldData.fileName,
      filePath: newData.filePath ? newData.filePath : oldData.filePath,
      agreementStatusId: newData.agreementStatusId ? newData.agreementStatusId : oldData.agreementStatusId,
      updatedBy: callerUserId,
      rejectionReason: newData.rejectionReason ? newData.rejectionReason : oldData.rejectionReason,
      userId: userId
    }
    if (agreementData.agreementStatusId && agreementData.agreementStatusId !== __constants.AGREEMENT_STATUS.rejected.statusCode) {
      agreementData.rejectionReason = null
    }
    const queryParam = []
    _.each(agreementData, (val) => queryParam.push(val))
    __logger.info('update->', agreementData, queryParam)
    if (agreementStatusEngine.canUpdateAgreementStatus(newData.agreementStatusId, oldData.agreementStatusId)) {
      __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateAgreement(), queryParam)
        .then(result => {
          __logger.info('result', { result })
          if (result && result.affectedRows && result.affectedRows > 0) {
            dataUpdated.resolve(agreementData)
          } else {
            dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
          }
        })
        .catch(err => {
          __logger.error('error: ', err)
          dataUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err })
        })
    } else {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.AGREEMENT_STATUS_CANNOT_BE_UPDATED, data: {} })
    }

    return dataUpdated.promise
  }

  getAllAgreement (columnArray, offset, ItemsPerPage, startDate, endDate, valArray) {
    __logger.info('Inside getAllAgreement')
    const fetchAgreement = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAgreementList(columnArray, startDate, endDate), [...valArray, ItemsPerPage, offset])
      .then(result => {
        if (result && result[0].length > 0) {
          fetchAgreement.resolve(result)
        } else {
          fetchAgreement.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        }
      })
      .catch(err => {
        fetchAgreement.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return fetchAgreement.promise
  }
}

module.exports = UserData
