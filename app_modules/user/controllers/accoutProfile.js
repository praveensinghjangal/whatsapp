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
const q = require('q')

/**
 * @namespace -Profile-Account-Controller-
 * @description In this Conroller profile account related API are build such as getAcountProfile, updateAcountProfile, checkAccountProfileCompletionStatus, generateAndUpdateTokenKey
 */

/**
 * @memberof -Profile-Account-Controller-
 * @name GetAcountProfile
 * @path {GET} /users/account
 * @description Bussiness Logic :- This API returns Profile account info.(Returns account info and its completition status)
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/generateAndUpdateTokenKey|GetAcountProfile}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns the object with accountId,tokenKey,accountManagerName,name,email,city etc
 * @code {200} if the msg is success than returns account info and its completition status.
 * @author Arjun Bhole 15th May, 2020
 * *** Last-Updated :- Danish Galiyara 30 July,2020 ***
 */

// Get Account Profile
const getAcountProfile = (req, res) => {
  __logger.info('Inside getAcountProfile', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let queryResult = {}
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserAccountProfile(), [userId])
    .then(results => {
      __logger.info('results Then 1')
      // __logger.info('Then 1', results)
      if (results && results.length > 0) {
        queryResult = results[0]
        // removed as there is no need for the agreement
        // queryResult.isAgreementUploaded = !!((queryResult && queryResult.agreementStatusId && queryResult.agreementStatusId === __constants.AGREEMENT_STATUS.pendingForApproval))
        if (queryResult.tfaType) queryResult.tfaTypeDisplayName = __constants.TFA_TYPE_DISPLAYNAME[queryResult.tfaType]
        return checkAccountProfileCompletionStatus(queryResult)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('data then 2', data)
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

/**
 * @memberof -Profile-Account-Controller-
 * @name UpdateAcountProfile
 * @path {PUT} /users/account
 * @description Bussiness Logic :- This API is use to update the profile's account with various attributes.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {string}  city- Provide the valid name of city
 * @body {string}  state - Provide the valid name of the state
 * @body {string}  country- Provide the valid name of the country
 * @body {string}  addressLine1 - Provide the valid addressLine1
 * @body {string}  addressLine2 - Provide the valid second addressLine1
 * @body {string}  phoneCode= - Provide the valid phone code
 * @body {string}  postalCode - Provide the valid postal code
 * @body {string}  contactNumber - Provide the valid contact Number
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than profiles account is updated than return completion status.
 * @author Arjun Bhole 15th May, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

// Update Account Prfofile

const updateAcountProfile = (req, res) => {
  __logger.info('Inside updateAcountProfile', req.user.user_id)
  const userService = new UserService()
  const validate = new ValidatonService()
  let accountProfileData
  if (req && req.body && req.body.addressLine2 === null) req.body.addressLine2 = ''
  validate.accountProfile(req.body)
    .then(data => {
      __logger.info('data then 1', { data })
      return userService.checkUserIdExistsForAccountProfile(req.user.user_id)
    })
    .then(result => {
      __logger.info('UserId exist check then 2', result.exists)
      if (result.exists) {
        saveHistoryData(result.rows[0], __constants.ENTITY_NAME.USER_ACCOUNT_PROFILE, req.user.user_id, req.user.user_id)
        accountProfileData = {
          userId: req.user && req.user.user_id ? req.user.user_id : '0',
          city: req.body.city ? req.body.city : result.rows[0].city,
          state: req.body.state ? req.body.state : result.rows[0].state,
          country: req.body.country ? req.body.country : result.rows[0].country,
          addressLine1: req.body.addressLine1 ? req.body.addressLine1 : result.rows[0].addressLine1,
          addressLine2: req.body.addressLine2 ? req.body.addressLine2 : null,
          contactNumber: req.body.contactNumber ? req.body.contactNumber : result.rows[0].contactNumber,
          phoneCode: req.body.phoneCode ? req.body.phoneCode : result.rows[0].phoneCode,
          postalCode: req.body.postalCode ? req.body.postalCode : result.rows[0].postalCode,
          firstName: req.body.firstName ? req.body.firstName : result.rows[0].firstName,
          lastName: req.body.lastName ? req.body.lastName : result.rows[0].lastName,
          accountManagerName: req.body.accountManagerName ? req.body.accountManagerName : result.rows[0].accountManagerName,
          accountTypeId: req.body.accountTypeId ? req.body.accountTypeId : __constants.ACCOUNT_PLAN_TYPE.Postpaid,
          phoneVerified: req.body.contactNumber === result.rows[0].contactNumber ? result.rows[0].phoneVerified : false
        }
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateUserAccountProfile(), [accountProfileData.city, accountProfileData.state, accountProfileData.country, accountProfileData.addressLine1, accountProfileData.addressLine2, accountProfileData.contactNumber, accountProfileData.phoneCode, accountProfileData.postalCode, accountProfileData.firstName, accountProfileData.lastName, accountProfileData.accountManagerName, accountProfileData.accountTypeId, accountProfileData.userId, accountProfileData.phoneVerified, accountProfileData.userId])
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

/**
 * @memberof -Profile-Account-Controller-
 * @name GenerateAndUpdateTokenKey
 * @path {PUT} /users/account/tokenKey
 * @description Bussiness Logic :- This API is used for updating user account token key..
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/generateAndUpdateTokenKey|GenerateAndUpdateTokenKey}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.tokenKey=sdvabsfbsbfdsdf3424fe342 - Returns the token key in data.
 * @code {200} if the msg is success than token key is generated/updated and it is given in response .
 * @author Arjun Bhole 29th July, 2020
 * *** Last-Updated :- Javedkl11 16 September,2020 ***
 */

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
      __logger.info('queryResult then 2')
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

/**
 * @memberof -Profile-Account-Controller-
 * @name GetAccountProfileByUserId
 * @path {GET} /users/account/info
 * @description Bussiness Logic :- This API returns Profile account info.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/getAccountProfileByUserId|GetAccountProfileByUserId}
 * @param {string}  userId - Enter userId
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - Returns the object with accountId,tokenKey,accountManagerName,name,email,city etc
 * @code {200} if the msg is success than returns account info.
 * @author Javed Khan 25th January, 2021
 * *** Last-Updated :- Javed Khan 25th January, 2021 ***
 */

const getAccountProfileByUserId = (req, res) => {
  __logger.info('inside getAccountProfileByUserId:: ', req.query)
  const userService = new UserService()
  const validate = new ValidatonService()
  validate.checkUserIdService(req.query)
    .then(data => userService.getAccountProfileByUserId(req.query.userId))
    .then(dbData => {
      __logger.info('db result:: ', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Profile-Account-Controller-
 * @name GetAccountProfileList
 * @path {GET} /users/account/list
 * @description Bussiness Logic :- This API returns array of users list.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/getAccountProfileList|GetAccountProfileList}
 * @param {number}  page - Enter page number here
 * @param {number}  ItemsPerPage - Enter records per page
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {object} metadata.data - In response we get array of json data consisting of accountId, firstName,lastName,email,phoneCode,contactNumber etc. in each object.
 * @code {200} if the msg is success than returns list of account details.
 * @author Javed Khan 25th January, 2021
 * *** Last-Updated :- Javed Khan 25th January, 2021 ***
 */

const getAccountProfileList = (req, res) => {
  __logger.info('inside getAccountList api:: ', req.query)
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page field is required with value as number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field is required with value as number' })
  if (+req.query.ItemsPerPage <= 0) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field value should be greater than zero' })
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  __logger.info('Get Offset value', offset, ItemsPerPage)
  const userService = new UserService()
  userService.getAccountProfileList(ItemsPerPage, offset)
    .then(dbData => {
      __logger.info('db result', dbData[1][0])
      const pagination = { totalPage: Math.ceil(dbData[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: dbData[0], pagination } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Profile-Account-Controller-
 * @name UpdateAccountManagerName
 * @path {PATCH} /users/account/accountManager
 * @description Bussiness Logic :- This API is use to update the profile's account manager name.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 *<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/updateAccountManagerName|UpdateAccountManagerName}
 * @body {string}  accountManagerName- Provide valid name for account manager
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @code {200} if the msg is success than profiles account manager name is updated.
 * @author Javed Khan 25th January, 2021
 * *** Last-Updated :- Javed Khan 25th January, 2021 ***
 */

const updateAccountManagerName = (req, res) => {
  __logger.info('inside updateAccountManagerName:: ', req.body)
  const userService = new UserService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validate.checkUserAccountManager(req.body)
    .then(data => userService.updateAccountManagerName(req.body.accountManagerName, userId))
    .then(dbData => {
      __logger.info('db result:: ', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// api specific to get email id of support user
const getUserRoleArrayDataForEmail = (req, res) => {
  const userDetails = q.defer()
  // need to change here change the query
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserRoleData(), [__constants.SUPPORT_ROLE_ID])
    .then(results => {
      __logger.info('results Then 1')
      if (results && results.length > 0) {
        userDetails.resolve(results)
      } else {
        userDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      userDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
  return userDetails.promise
}

module.exports = {
  getAcountProfile,
  updateAcountProfile,
  checkAccountProfileCompletionStatus,
  generateAndUpdateTokenKey,
  getAccountProfileByUserId,
  getAccountProfileList,
  updateAccountManagerName,
  getUserRoleArrayDataForEmail
}
