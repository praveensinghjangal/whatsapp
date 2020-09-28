const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')
const UserService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const _ = require('lodash')

// Get Account Profile
const getAcountProfile = (req, res) => {
  __logger.info('Inside getAcountProfile', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let queryResult = {}
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
    .then(results => {
      __logger.info('Then 1')
      // __logger.info('Then 1', results)
      if (results && results.length > 0) {
        queryResult = results[0]
        queryResult.isAgreementUploaded = !!(queryResult && queryResult.isAgreementUploaded)
        return checkAccountProfileCompletionStatus(queryResult)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      queryResult.complete = data.complete
      __logger.info('queryResult', queryResult)
      __logger.info('data', data)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: queryResult
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// Update Account Prfofile

const updateAcountProfile = (req, res) => {
  __logger.info('Inside updateAcountProfile', req.user.user_id)
  const userService = new UserService()
  const validate = new ValidatonService()
  let accountProfileData

  validate.accountProfile(req.body)
    .then(data => {
      return userService.checkUserIdExistsForAccountProfile(req.user.user_id)
    })
    .then(result => {
      __logger.info('UserId exist check then 1', result.exists)
      if (result.exists) {
        saveHistoryData(result.rows[0], __constants.ENTITY_NAME.USER_ACCOUNT_PROFILE, req.user.user_id, req.user.user_id)
        accountProfileData = {
          userId: req.user && req.user.user_id ? req.user.user_id : '0',
          city: req.body.city ? req.body.city : result.rows[0].city,
          state: req.body.state ? req.body.state : result.rows[0].state,
          country: req.body.country ? req.body.country : result.rows[0].country,
          addressLine1: req.body.addressLine1 ? req.body.addressLine1 : result.rows[0].addressLine1,
          addressLine2: req.body.addressLine2 ? req.body.addressLine2 : result.rows[0].addressLine2,
          contactNumber: req.body.contactNumber ? req.body.contactNumber : result.rows[0].contactNumber,
          phoneCode: req.body.phoneCode ? req.body.phoneCode : result.rows[0].phoneCode,
          postalCode: req.body.postalCode ? req.body.postalCode : result.rows[0].postalCode,
          firstName: req.body.firstName ? req.body.firstName : result.rows[0].firstName,
          lastName: req.body.lastName ? req.body.lastName : result.rows[0].lastName,
          accountManagerName: req.body.accountManagerName ? req.body.accountManagerName : result.rows[0].accountManagerName,
          accountTypeId: req.body.accountTypeId ? req.body.accountTypeId : __constants.ACCOUNT_PLAN_TYPE.Prepaid
        }
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateUserAccountProfile(), [accountProfileData.city, accountProfileData.state, accountProfileData.country, accountProfileData.addressLine1, accountProfileData.addressLine2, accountProfileData.contactNumber, accountProfileData.phoneCode, accountProfileData.postalCode, accountProfileData.firstName, accountProfileData.lastName, accountProfileData.accountManagerName, accountProfileData.accountTypeId, accountProfileData.userId, accountProfileData.userId])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(result => {
      __logger.info('then 3')
      if (result && result.affectedRows && result.affectedRows > 0) {
        return checkAccountProfileCompletionStatus(accountProfileData)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.PROCESS_FAILED, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('data')
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: { complete: data.complete }
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

function checkAccountProfileCompletionStatus (data) {
  const checkCompleteStatus = new CheckInfoCompletionService()
  return checkCompleteStatus.checkAccountProfileStatus(data)
}

const generateAndUpdateTokenKey = (req, res) => {
  __logger.info('Inside generateAndUpdateTokenKey', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let tokenData = {}
  let dbData = {}
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
    .then(result => {
      __logger.info('Then 1')
      // __logger.info('Then 1', results)
      if (result && result.length > 0) {
        const queryParam = []
        tokenData = {
          token_key: new UniqueId().uuid(),
          updated_by: userId,
          user_id: userId
        }
        dbData = result[0]
        _.each(tokenData, (val) => queryParam.push(val))
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateTokenInAccountProfile(), queryParam)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(result => {
      __logger.info('queryResult')
      delete tokenData.updated_by
      delete tokenData.user_id
      saveHistoryData(dbData, __constants.ENTITY_NAME.USERS, dbData.accountId, userId)
      return __util.send(res, {
        type: __constants.RESPONSE_MESSAGES.SUCCESS,
        data: tokenData
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getAcountProfile,
  updateAcountProfile,
  checkAccountProfileCompletionStatus,
  generateAndUpdateTokenKey
}
