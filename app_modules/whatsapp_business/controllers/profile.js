const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const q = require('q')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const multer = require('multer')
const fs = require('fs')
const url = require('../../../lib/util/url')
const { FileStream } = require('../../../lib/util/fileStream')
const { FileDownload } = require('../../../lib/util/fileDownload')
const BusinessAccountService = require('../services/businesAccount')
const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')
const integrationService = require('../../../app_modules/integration')
const HttpService = require('../../../lib/http_service')
const _ = require('lodash')
const WabaStatusService = require('../services/wabaStatusEngine')
const otherModuleCallService = require('../services/otherModuleCalls')
const Hooks = require('../services/hooks')
const __config = require('../../../config')

/**
 * @namespace -Whatsapp-Business-Account-(WABA)-Controller-
 * @description This Controller consist of API's related to whatsapp business account (WABA) information of registered user
 *  * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */

const callApiToGetTps = (userId, authToken) => {
  this.http = new HttpService(60000)
  const headers = {
    Authorization: authToken,
    'User-Agent': __constants.INTERNAL_CALL_USER_AGENT
  }
  let url = __config.base_url + __constants.INTERNAL_END_POINTS.getTps
  url = url.split(':userId').join(userId || '')
  __logger.info('Calling Api To Get Tps', url)
  return this.http.Get(url, headers)
}

const callUpdateServiceProviderDetails = (reqBody, authToken) => {
  this.http = new HttpService(60000)
  const headers = {
    Authorization: authToken,
    'User-Agent': __constants.INTERNAL_CALL_USER_AGENT
  }
  __logger.info('Calling Update Service Provider Details API')
  return this.http.Patch(reqBody, __config.base_url + __constants.INTERNAL_END_POINTS.updateServiceProvider, headers)
}

const callUpdateAccountConfigApi = (reqBody, authToken) => {
  this.http = new HttpService(60000)
  const headers = {
    Authorization: authToken,
    'User-Agent': __constants.INTERNAL_CALL_USER_AGENT

  }
  __logger.info('Calling Update Account Config  API')
  return this.http.Patch(reqBody, __config.base_url + __constants.INTERNAL_END_POINTS.updateAccountConfig, headers)
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name getBusinessProfile
 * @path {get} /business/profile
 * @description Bussiness Logic :- This API returns waba business profile details from user id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getBusinessProfile|getBusinessProfile}
 * @param {string}  userId=3234  - user id needs to be entered here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data in each object.
 * @code {200} if the msg is success than Returns array of object.
 * @author Danish Galiyara 30th November, 2020
 * *** Last-Updated :- Danish Galiyara 30th November, 2020 ***
 */

// Get Business Profile
const getBusinessProfile = (req, res) => {
  __logger.info('getBusinessProfile:>>>>>>>>>>>>>')
  let queryResult = []
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  let providerId
  let maxTpsToProvider
  let finalResponse
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getBusinessProfileInfo(userId)
    .then(results => {
      // __logger.info('Then 1', results)
      queryResult = results[0]
      if (results && results.length > 0) {
        results[0].canReceiveSms = results[0].canReceiveSms === 1
        results[0].canReceiveVoiceCall = results[0].canReceiveVoiceCall === 1
        results[0].associatedWithIvr = results[0].associatedWithIvr === 1
        results[0].businessManagerVerified = results[0].businessManagerVerified === 1
        providerId = results[0].serviceProviderId
        maxTpsToProvider = results[0].maxTpsToProvider
        const checkCompleteStatus = new CheckInfoCompletionService()
        return checkCompleteStatus.validateBusinessProfile(results[0])
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('then 2')
      if (data.err) {
        return computeBusinessAccessAndBusinessProfleCompleteStatus(data)
      } else {
        return { businessAccessProfileCompletionStatus: data ? data.complete : true, businessProfileCompletionStatus: true }
      }
    })
    .then(result => {
      __logger.info('Then 3', { result })
      return formatFinalStatus(queryResult, result)
    })
    .then(responseBody => {
      finalResponse = responseBody
      if (finalResponse && finalResponse.wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        const wabaAccountService = new integrationService.WabaAccount(providerId, maxTpsToProvider, userId)
        return wabaAccountService.getAccountPhoneNoList(req.user.wabaPhoneNumber)
      } else {
        finalResponse.qualityRating = 'N/A'
        return {}
      }
    })
    .then(phoneNumberDetails => {
      finalResponse.qualityRating = phoneNumberDetails && phoneNumberDetails.data && phoneNumberDetails.data.quality_score && phoneNumberDetails.data.quality_score.score ? phoneNumberDetails.data.quality_score.score : 'N/A'
      __logger.info('Final Result then 4', finalResponse)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: finalResponse })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name AddupdateBusinessAccountInfo
 * @path {POST} /business/profile/accessInformation
 * @description Bussiness Logic :-This api is used to add or update business access information.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/addupdatebusinessprofilraccessInformation|AddupdateBusinessAccountInfo}
 * @body {string} facebookManagerId
 * @body {string} businessName
 * @body {string} phoneCode
 * @body {string} phoneNumber
 * @body {boolean} canReceiveSms=true
 * @body {boolean} canReceiveVoiceCall=false
 * @body {boolean} associatedWithIvr=false
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns businessProfileCompletionStatus as true.
 * @code {200} if the msg is success than Returns Status of business profile info completion.
 * @author Arjun Bhole 3rd June, 2020
 * *** Last-Updated :- Arjun Bhole 15th Jan, 2020 ***
 */

const addupdateBusinessAccountInfo = (req, res) => {
  __logger.info('Inside addupdateBusinessAccountInfo', req.user.user_id, req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validate = new ValidatonService()
  const businessAccountService = new BusinessAccountService()
  const wabaStatusService = new WabaStatusService()
  let queryResult
  if (req && req.body) {
    req.body.associatedWithIvr = req.body.associatedWithIvr ? req.body.associatedWithIvr : false
  }
  validate.businessAccessInfo(req.body)
    .then(data => {
      __logger.info(' then 1')
      return businessAccountService.checkUserIdExist(userId)
    })
    .then(result => {
      __logger.info(' then 2')
      queryResult = result
      if (result && result.exists) {
        const finalObj = {
          facebookManagerId: req.body && req.body.facebookManagerId ? req.body.facebookManagerId : result.record.facebookManagerId,
          businessName: req.body && req.body.businessName ? req.body.businessName : result.record.businessName,
          phoneCode: req.body && req.body.phoneCode ? req.body.phoneCode : result.record.phoneCode,
          phoneNumber: req.body && req.body.phoneNumber ? req.body.phoneNumber : result.record.phoneNumber,
          canReceiveSms: req.body && typeof req.body.canReceiveSms === 'boolean' ? req.body.canReceiveSms : result.record.canReceiveSms,
          canReceiveVoiceCall: req.body && typeof req.body.canReceiveVoiceCall === 'boolean' ? req.body.canReceiveVoiceCall : result.record.canReceiveVoiceCall,
          associatedWithIvr: req.body && typeof req.body.associatedWithIvr === 'boolean' ? req.body.associatedWithIvr : result.record.associatedWithIvr,
          businessManagerVerified: result.record.businessManagerVerified
        }
        return validate.isAddUpdateBusinessAccessInfoComplete(finalObj)
      } else {
        return validate.isAddUpdateBusinessAccessInfoComplete(req.body)
      }
    })
    .then((result) => {
      __logger.info(' then 3 Waba access infor completion statu', result)
      __logger.info('Query result  >>>>>>>>>>>>>', queryResult)
      req.body.wabaProfileSetupStatusId = result && result.complete ? __constants.WABA_PROFILE_STATUS.pendingForSubmission.statusCode : __constants.WABA_PROFILE_STATUS.profileIncomplete.statusCode
      if (req.body && req.body.wabaProfileSetupStatusId && req.body.wabaProfileSetupStatusId !== __constants.WABA_PROFILE_STATUS.rejected) {
        req.body.accessInfoRejectionReason = null
      }
      if (queryResult && !queryResult.exists) {
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else if (wabaStatusService.canUpdateWabaStatus(req.body.wabaProfileSetupStatusId, queryResult.record.wabaProfileSetupStatusId)) {
        return businessAccountService.updateBusinessData(req.body, queryResult.record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_UPDATED, data: {}, err: {} })
      }
    })
    .then(data => {
      __logger.info('After Insert Update', data)
      const qrynum = queryResult && queryResult.exists ? queryResult.record.phoneCode + queryResult.record.phoneNumber : null // if(qrynum != reqNum) call api
      const reqNum = req.body.phoneCode && req.body.phoneNumber ? req.body.phoneCode + req.body.phoneNumber : null // if(qrynum != reqNum) call api
      if (reqNum && reqNum !== null && qrynum !== reqNum) {
        otherModuleCallService(reqNum, data.wabaInformationId, userId)
      }
      let name = ''
      _.each(__constants.WABA_PROFILE_STATUS, (val, key) => {
        if (data.wabaProfileSetupStatusId && val.statusCode && val.statusCode === data.wabaProfileSetupStatusId) name = val.displayName
      })
      return { name, id: data.wabaProfileSetupStatusId }
    })
    .then(wabaProfileSetupStatus => {
      __logger.info(' then 6')
      __logger.info('After inserting or updating', wabaProfileSetupStatus)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { wabaProfileSetupStatus: wabaProfileSetupStatus.name, wabaProfileSetupStatusId: wabaProfileSetupStatus.id } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name AddUpdateBusinessProfile
 * @path {POST} /business/profile
 * @description Bussiness Logic :- API to add or update business profile.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/add/updatebusinessprofile|AddUpdateBusinessProfile}
 * @body {string} whatsappStatus
 * @body {string} description
 * @body {string} address
 * @body {string} country
 * @body {string} city
 * @body {string} state
 * @body {string} postalCode
 * @body {string} email
 * @body {string} businessCategoryId
 * @body {string} serviceProviderId
 * @body {string} apiKey
 * @body {string} webhookPostUrl
 * @body {string} optinText
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns businessProfileCompletionStatus as true.
 * @code {200} if the msg is success than Returns Status of business profile info completion.
 * @author Danish Galiyara 3rd june, 2020
 * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */

// todo : add check if category id exists in master
const addUpdateBusinessProfile = (req, res) => {
  __logger.info('addUpdateBusinessProfile::API TO ADD/UPDATE BUSINESS PROFILE CALLED', req.user.user_id)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  this.http = new HttpService(60000)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  let wabaProfileData = {}
  let profileData = {}
  let providerId
  validate.addUpdateBusinessInfo(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      if (!data.exists || !data.record || !data.record.wabaProfileSetupStatusId || data.record.wabaProfileSetupStatusId !== __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_UPDATED, err: {}, data: {} })
      }
      profileData = data
      providerId = req.user.providerId || (profileData.exists ? profileData.record.serviceProviderId : '')
      __logger.info('addUpdateBusinessProfile::PROVID===-', req.user.providerId, providerId, req.user.wabaPhoneNumber)
      return businessAccountService.getWebsiteLimitByProviderId(providerId)
    })
    .then(websiteLimitByProvider => {
      __logger.info('addUpdateBusinessProfile::apiREsponse', websiteLimitByProvider)
      // __logger.info('addUpdateBusinessProfile::exists ----------------->', profileData)
      const maxWebsiteAlwd = websiteLimitByProvider && websiteLimitByProvider[0] && websiteLimitByProvider[0].maxWebsiteAllowed ? websiteLimitByProvider[0].maxWebsiteAllowed : 0
      if (req.body.websites && req.body.websites !== [] && req.body.websites.length > maxWebsiteAlwd) {
        __logger.info('addUpdateBusinessProfile::maxWebsiteAllowed', maxWebsiteAlwd)
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Maximum website allowed by provider is: ' + maxWebsiteAlwd, data: {} })
      }
      if (!profileData.exists) {
        req.body.wabaProfileSetupStatusId = __constants.DEFAULT_WABA_SETUP_STATUS_ID
        return businessAccountService.insertBusinessData(userId, req.body, {})
      } else {
        __logger.info('addUpdateBusinessProfile::time to update')
        return businessAccountService.updateBusinessData(req.body, profileData.record || {}, userId)
      }
    })
    // call integration here in .then
    .then(data => {
      wabaProfileData = data
      // __logger.info('addUpdateBusinessProfile::ddddd----', data)
      if (wabaProfileData && wabaProfileData.wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        __logger.info('addUpdateBusinessProfile::called tyntec api to update profile data---')
        const wabaAccountService = new integrationService.WabaAccount(providerId, maxTpsToProvider, userId)
        return wabaAccountService.updateProfile(req.user.wabaPhoneNumber, wabaProfileData)
      } else {
        __logger.info('addUpdateBusinessProfile::status not accepted')
        return data
      }
    })
    .then(apiResponse => {
      if (apiResponse && apiResponse.status_code === 400) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Website URL must be valid and start with http or https', data: {} })
      } else if (apiResponse && apiResponse.status_code === 404) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .then(data => validate.isAddUpdateBusinessInfoComplete(wabaProfileData))
    .then(data => {
      __logger.info('addUpdateBusinessProfile::After inserting or updating', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessProfileCompletionStatus: data } })
    })
    .catch(err => {
      __logger.error('addUpdateBusinessProfile::error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name MarkManagerVerified
 * @path {POST} /business/profile/markManagerVerified
 * @description Bussiness Logic :- This API marks manager verified
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/markmanagerverified|MarkManagerVerified}
 * @body {boolean} businessManagerVerified=true
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns businessVerificationCompletionStatus as true.
 * @code {200} if the msg is success than Returns Status of business verification completion.
 * @author Danish Galiyara 4th June, 2020
 * *** Last-Updated :- Arjun Bhole 26th November, 2020 ***
 */

const markManagerVerified = (req, res) => {
  __logger.info('API TO MARK BUSINESS MANAGER VERIFIED', req.user.user_id, req.body)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const wabaStatusService = new WabaStatusService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let queryResult
  let newStatus
  validate.markManagerVerified(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      __logger.info('exists -----------------> then 2', data)
      queryResult = data
      if (!data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        queryResult.record.businessManagerVerified = req.body.businessManagerVerified
        __logger.info('time to update')
        return validate.isAddUpdateBusinessAccessInfoComplete(queryResult.record, false)
      }
    })
    .then((result) => {
      __logger.info(' then 3 Waba access infor completion statu', result)
      newStatus = result && result.complete ? __constants.WABA_PROFILE_STATUS.pendingForSubmission.statusCode : __constants.WABA_PROFILE_STATUS.profileIncomplete.statusCode
      req.body.wabaProfileSetupStatusId = newStatus
      return wabaStatusService.canUpdateWabaStatus(newStatus, queryResult.record.wabaProfileSetupStatusId)
    })
    .then(data => {
      __logger.info('datatatatata then 4', data)
      if (data) {
        return businessAccountService.updateBusinessData(req.body, queryResult.record, userId)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_UPDATED, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Marking Manager verified then 5', data)
      const wabaProfileSetupStatusObj = _.find(__constants.WABA_PROFILE_STATUS, obj => obj.statusCode.toLowerCase() === data.wabaProfileSetupStatusId.toLowerCase())
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true, wabaProfileSetupStatus: wabaProfileSetupStatusObj.displayName, wabaProfileSetupStatusId: wabaProfileSetupStatusObj.statusCode } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

function computeBusinessAccessAndBusinessProfleCompleteStatus (data) {
  __logger.info('AcomputeBusinessAccessAndBusinessProfleCompleteStatus >>')
  // __logger.info('Input Data ', data)
  const businessProfilePromise = q.defer()
  const errorFields = data.fieldErr
  const businessProfileFields = ['whatsappStatus', 'description', 'address', 'country', 'email', 'businessCategory', 'city', 'postalCode']
  // const businessProfileFields = ['businessName', 'whatsappStatus', 'description', 'address', 'country', 'email', 'businessCategory', 'city', 'postalCode']
  data.businessAccessProfileCompletionStatus = true
  data.businessProfileCompletionStatus = true
  for (let key = 0; key < errorFields.length; key++) {
    if (businessProfileFields.includes(errorFields[key])) {
      data.businessProfileCompletionStatus = false
    }
  }
  delete data.fieldErr
  delete data.complete
  businessProfilePromise.resolve(data)
  return businessProfilePromise.promise
}

function formatFinalStatus (queryResult, result) {
  const finalResult = q.defer()
  queryResult.businessProfileCompletionStatus = result.businessProfileCompletionStatus ? result.businessProfileCompletionStatus : false
  queryResult.businessAccessProfileCompletionStatus = result.businessAccessProfileCompletionStatus ? result.businessAccessProfileCompletionStatus : false
  queryResult.phoneVerified = queryResult.phoneVerified === 1
  finalResult.resolve(queryResult)
  return finalResult.promise
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name UpdateServiceProviderDetails
 * @path {PUT} /business/profile/serviceProvider
 * @description Bussiness Logic :- This API is used for updating service provider id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/updateServiceProviderDetails|UpdateServiceProviderDetails}
 * @body {string} serviceProviderId
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Returns Service Provider Id in response according to user Id.
 * @code {200} if the msg is success than Returns Service Provider Id.
 * @author Arjun Bhole 29th July, 2020
 * *** Last-Updated :- Danish Galiyara 24th December, 2020 ***
 */
const updateServiceProviderDetails = (req, res) => {
  __logger.info('Inside updateServiceProviderDetails')
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()
  const hooks = new Hooks()
  let wabaData = {}
  validationService.updateServiceProviderDetails(req.body)
    .then(data => businessAccountService.getBusinessProfileInfo(req.body.userId))
    .then(results => {
      __logger.info('Then 2 waba data')
      if (results && results.length > 0) {
        wabaData = results[0]
        return businessAccountService.updateServiceProviderDetails(req.body.userId, callerUserId, results[0], req.body)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(result => {
      __logger.info('Then 3', result)
      _.each(result, (val, key) => { wabaData[key] = val })
      if (req.body.serviceProviderUserAccountId || req.body.apiKey) hooks.trigger(wabaData, wabaData.wabaProfileSetupStatusId, req.headers)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const updateWabaPhoneNumber = (req, res) => {
  __logger.info('Inside updateWabaPhoneNumber')
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()

  validationService.checkPhoneCodeAndPhoneNumberService(req.body)
    .then(data => businessAccountService.checkWabaNumberAlreadyExist(req.body.phoneCode, req.body.phoneNumber, userId))
    .then(results => {
      __logger.info('Then 2')
      return businessAccountService.updateWabaNumberAndPhoneCode(userId, req.body.phoneCode, req.body.phoneNumber, req.body.wabaInformationId)
    })
    .then(result => {
      __logger.info('Then 3', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}
/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name AddUpdateOptinMessage
 * @path {POST} /business/profile/optinmessage
 * @description Bussiness Logic :- This API is used TO Add Update Optin Message.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 * @body {string} optinText
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Returns add/update the optin record and send the object in response according to user Id.
 * @code {200} if the msg is success than Add/Update optin message is done
 * @author Danish Galiyara 10th September, 2020
 * *** Last-Updated :- Arjun Bhole 20th November, 2020 ***
 */

const addUpdateOptinMessage = (req, res) => {
  __logger.info('API TO Add Update Optin Message', req.user.user_id)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  let record
  validate.addUpdateOptinMessage(req.body)
    .then(data => businessAccountService.checkUserIdExist(userId))
    .then(data => {
      __logger.info('exists -----------------> then 2', { data })
      if (!data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        record = data.record
        __logger.info('time to update')
        // return
        return validate.isAddUpdateBusinessAccessInfoComplete(record)
      }
    })
    .then(data => {
      __logger.info('datatatatata then 3', { data })
      if (data && data.complete) {
        return validate.isAddUpdateBusinessInfoComplete(record)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_ACCESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('data then 4 >>')
      if (data) {
        return businessAccountService.updateBusinessData(req.body, record || {}, userId)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.BUSINESS_INFO_NOT_COMPLETE, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('After Adding Or Updating Optin Message then 5', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { businessVerificationCompletionStatus: true } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

const filter = function (req, file, cb) {
  __logger.info('filter')
  var filetypes = /(jpe?g|png)$/i
  let fileExt = file.originalname.split('.')
  fileExt = fileExt[fileExt.length - 1]
  var extname = filetypes.test(fileExt.toLowerCase())
  __logger.info('file mime type filter  -->', extname, fileExt)
  if (extname) {
    return cb(null, true)
  } else {
    const err = { ...__constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'File upload only supports the following filetypes - jpg, jpeg, png' }
    cb(err)
  }
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name UpdateProfilePic
 * @path {PUT} /business/profile/logo
 * @description Bussiness Logic :- This API is used to upload profile photo.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
<br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/uploadprofilephoto|UpdateProfilePicUpdateProfilePic}
 * @body {form-data} profilePicture - Upload the file in form-data request, assign key as profilePicture and value as profile photo file to update.
 * @code {200} if the msg is success than profile picture uploaded successfully.
 * @author Javed kh11 6th October, 2020
 * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */
const upload = multer({
  fileFilter: filter,
  limits: { fileSize: __constants.FILE_MAX_UPLOAD_IN_BYTE }
}).array('profilePicture', 1)

const updateProfilePic = (req, res) => {
  __logger.info('updateProfilePic>>>>>>>>>>>>>>>...........')
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const maxTpsToProvider = req.user && req.user.maxTpsToProvider ? req.user.maxTpsToProvider : 10
  const businessAccountService = new BusinessAccountService()
  __logger.info('RTRT', req.user, req.user.user_id)
  upload(req, res, function (err, data) {
    __logger.info('Hello ----------->', data, err)
    if (err) {
      if (err.code === __constants.CUSTOM_CONSTANT.UPLOAD_ERROR_MSG.LIMIT_FILE_SIZE) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: { maxFileSizeInBytes: __constants.FILE_MAX_UPLOAD_IN_BYTE }, data: {} })
      } else {
        return res.send(err)
      }
    }
    if (!req.files || (req.files && !req.files[0])) {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.PROVIDE_FILE, data: {} })
    } else {
      const imageData = req.files && req.files[0].buffer

      businessAccountService.checkUserIdExist(userId)
        .then(results => {
          __logger.info('got result', results.record)
          if (results && results.record !== '') {
            if (results.record.wabaProfileSetupStatusId !== __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
              return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_UPDATED, err: {}, data: {} })
            } else {
              const providerId = req.user.providerId || (results.exists ? results.record.serviceProviderId : '')
              const wabaAccountService = new integrationService.WabaAccount(providerId, maxTpsToProvider, userId)
              const reqBody = {
                imageData: imageData,
                userId,
                phoneCode: results.record.phoneCode,
                phoneNumber: results.record.phoneNumber
              }
              results.record.userId = userId
              businessAccountService.updateBusinessData(reqBody, results.record, userId)
              return wabaAccountService.updateProfilePic(req.user.wabaPhoneNumber, req.files[0].buffer, req.files[0].mimetype)
            }
          } else {
            return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
          }
        })
        .then(accountData => {
          return __util.send(res, accountData)
        })
        .catch(err => {
          __logger.error('error: ', err)
          return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
        })
    }
  })
}
/* Not in use */
const updateProfilePicByUrl = (req, res) => {
  __logger.info('updateProfilePicByUrl::url', req.body.profilePic)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const wabaAccountService = new integrationService.WabaAccount(req.user.providerId, req.user.maxTpsToProvider, userId)
  const fileStream = new FileStream()
  const fileDownload = new FileDownload()
  __logger.info('updateProfilePicByUrl::userId', req.user, req.user.user_id)
  if (!req.body.profilePic || req.body.profilePic === '') {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Enter url to update', data: {} })
  }
  if (!url.isValid(req.body.profilePic)) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_URL, err: {}, data: {} })
  }
  let fileName = req.body.profilePic.split('/')
  fileName = fileName[fileName.length - 1]
  if (fileName.split('.')[1] === undefined) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'Profile pic needs to be one among the following filetypes - jpg, jpeg, png', data: {} })
  }
  const fileExt = fileName.split('.')[1]
  let fileRes = ''
  let resultRecord = ''
  var filetypes = __constants.VALIDATOR.fileExtType
  var extname = filetypes.test(fileExt.toLowerCase())
  if (!extname) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_TYPE, err: 'Profile pic only supports the following filetypes - jpg, jpeg, png', data: {} })
  }
  __logger.info('updateProfilePicByUrl::file ext validation', extname)
  // download(req.body.profilePic, fileName, function () {
  fileDownload.downloadFile(req.body.profilePic, fileName, function () {
    __logger.info('updateProfilePicByUrl::file downloaded', fileName)
    businessAccountService.checkUserIdExist(userId)
      .then(result => {
        __logger.info('updateProfilePicByUrl:: user exists ? ---------->', { result })
        if (result && result.record !== '') {
          resultRecord = result.record
          const data = fs.readFileSync(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName)
          return wabaAccountService.updateProfilePic(req.user.wabaPhoneNumber, data)
        } else {
          return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
      })
      .then(apiResponse => {
        __logger.info('updateProfilePicByUrl::', { apiResponse, status_code: apiResponse.type.status_code })
        if (apiResponse && apiResponse.type.status_code === 200) {
          return businessAccountService.updateProfilePicUrl(req.body.profilePic, req.user.user_id)
        } else if (apiResponse && apiResponse.type.status_code === 400) {
          // async function call
          fileRes = fileStream.deleteFile(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName, fileName)
          __logger.info('updateProfilePicByUrl', { fileRes })
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_FILE_SIZE, err: 'Add image with large size', data: {} })
        }
      })
      .then(result => {
        if (result && result.affectedRows > 0) {
          __logger.info('updateProfilePicByUrl:: updated pic in db', { result })
          saveHistoryData(resultRecord, __constants.ENTITY_NAME.WABA_INFORMATION, resultRecord.wabaInformationId, userId)
          fileStream.deleteFile(__constants.PUBLIC_FOLDER_PATH + '/downloads/' + fileName, fileName)
          return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || {} })
      })
  })
}

function responseHandler (code) {
  switch (code) {
    case 3000:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
    case 4000:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {}, data: {} })
    case 4004:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NOT_FOUND, err: {}, data: {} })
    default:
      return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {}, data: {} })
  }
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name addUpdateWabaConfiguration
 * @path {patch} /business/profile/configure
 * @description Bussiness Logic :- This API adds the configurations of the waba account.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/addUpdateWabaConfiguration|addUpdateWabaConfiguration}
 * @body {!number} templatesAllowed=0
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  Returns success when transaction completed.
 * @code {200} if the msg is success than Returns success after completion.
 * @author Arjun Bhole 24th February, 2021
 * *** Last-Updated :- Arjun Bhole 24th February, 2021 ***
 */

const addUpdateWabaConfiguration = (req, res) => {
  __logger.info('API To Add Update Waba Configuration', req.user.user_id, req.body)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : 0
  validate.checkWabaConfigurationInput(req.body)
    .then(data => businessAccountService.checkUserIdExist(req.body.userId))
    .then(data => {
      // __logger.info('exists -----------------> then 2', data)
      if (data && data.exists && data.record && data.record.wabaProfileSetupStatusId && data.record.wabaProfileSetupStatusId !== __constants.WABA_PROFILE_STATUS.accepted.statusCode) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_ERROR, err: {}, data: {} })
      }
      if (data && !data.exists) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      } else {
        return businessAccountService.updateBusinessData({ templatesAllowed: req.body.templatesAllowed }, data.record || {}, callerUserId)
      }
    })
    .then(data => {
      const reqBody = {
        userId: req.body.userId,
        serviceProviderId: req.body.serviceProviderId,
        apiKey: req.body.apiKey,
        serviceProviderUserAccountId: req.body.serviceProviderUserAccountId,
        maxTpsToProvider: req.body.maxTpsToProvider
      }
      return callUpdateServiceProviderDetails(reqBody, req.headers.authorization)
    })
    .then(data => {
      if (data && data.code === 2000) {
        const rebBody = {
          tps: req.body.tps,
          userId: req.body.userId
        }
        return callUpdateAccountConfigApi(rebBody, req.headers.authorization)
      } else {
        return responseHandler(data.code)
      }
    })
    .then(data => {
      __logger.info('call Update Account Config Api response', data)
      if (data && data.code === 2000) {
        return true
      } else {
        return responseHandler(data.code)
      }
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetProfileList
 * @path {get} /business/profile/list
 * @description Bussiness Logic :- This API returns waba profile details with Status.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getProfileListByStatusId|getProfileListByStatusId}
 * @param {string}  statusId=b2aacfbc-12da-4748-bae9-b4ec26e37840 - Please provide valid wabaProfile statusId here.
 * @param {number}  page - Enter page number here
 * @param {number}  ItemsPerPage - Enter records per page
 * @param {string}  startDate - Enter start date
 * @param {string}  endDate - Enter end date
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of wabaInformationId, phoneNumber, phoneCode, facebookManagerId, userId and businessName in each object.
 * @code {200} if the msg is success than Returns wabaInformationId, phoneNumber, phoneCode, facebookManagerId, userId and businessName.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Vasim Gujrati 24nd FEB, 2021 ***
 */

const getProfileListByStatusId = (req, res) => {
  __logger.info('called api to get wabaProfile list', req.query)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  const errArr = []
  if (isNaN(req.query.page)) errArr.push('please provide page in query param of type integer')
  if (isNaN(req.query.itemsPerPage)) errArr.push('please provide itemsPerPage in query param of type integer')
  if (errArr.length > 0) {
    return __util.send(res, {
      type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: errArr
    })
  }

  const requiredPage = req.query.page ? +req.query.page : 1
  const itemsPerPage = req.query ? +req.query.itemsPerPage : 5
  const offset = itemsPerPage * (requiredPage - 1)

  validate.getProfileListByStatusId(req.query)
    .then(valRes => {
      const inputArray = []
      const valArray = []
      const columnArray = []

      if (req.query && req.query.phoneNumber) {
        req.query.phoneNumber = req.query.phoneNumber.split('+').join('')
        inputArray.push({ colName: 'CONCAT(wa.phone_code,wa.phone_number)', value: req.query.phoneNumber.replace(/ /g, ''), type: 'like' })
      }
      if (req.query && req.query.startDate && req.query.endDate) inputArray.push({ colName: 'wa.updated_on', value: [req.query.startDate, req.query.endDate], type: 'between' })
      if (req.query && req.query.statusId) inputArray.push({ colName: 'wa.waba_profile_setup_status_id', value: req.query.statusId, type: 'default' })
      _.each(inputArray, function (input) {
        if (input.value !== undefined && input.value !== null) {
          columnArray.push({ colName: input.colName, type: input.type })
          valArray.push(input.value)
        }
      })
      return businessAccountService.getBusinessProfileListByStatusId(columnArray, offset, itemsPerPage, valArray.flat())
    })
    .then(result => {
      const pagination = { totalPage: Math.ceil(result[0][0].totalFilteredRecord / itemsPerPage), currentPage: requiredPage, totalFilteredRecord: result[0][0].totalFilteredRecord, totalRecord: result[1][0].totalRecord }
      _.each(result[0], singleObj => {
        delete singleObj.totalFilteredRecord
      })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: result[0], pagination } })
    })
    .catch(err => {
      __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetProfileByWabaId
 * @path {get} /business/profile/info/:wabaId
 * @description Bussiness Logic :- This API returns waba profile details based on waba_information_id.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getProfileByWabaId|getProfileByWabaId}
 * @param {string}  wabaId=f742d535-4161-4a11-b99f-0c97154b720d - Please provide valid wabaId here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data in each object.
 * @code {200} if the msg is success than Returns array of object.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Arjun Bhole 25th February, 2021 ***
 */

const getProfileByWabaId = (req, res) => {
  __logger.info('called api to get wabaProfileData by wabaId------', req.params)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  let dbResult
  validate.getProfileDataByWabaId(req.params)
    .then(data => businessAccountService.getProfileDataByWabaId(req.params.wabaId))
    .then(dbData => {
      __logger.info('get Profile Data By WabaId result', dbData)
      if (dbData && dbData.length > 0) {
        dbData[0].canReceiveSms = dbData[0].canReceiveSms === 1
        dbData[0].canReceiveVoiceCall = dbData[0].canReceiveVoiceCall === 1
        dbData[0].associatedWithIvr = dbData[0].associatedWithIvr === 1
        dbData[0].businessManagerVerified = dbData[0].businessManagerVerified === 1
        dbResult = dbData[0]
        return dbData[0]
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then((data) => callApiToGetTps(data.userId, req.headers.authorization))
    .then((result) => {
      if (result && result.code === 2000) {
        dbResult.tps = result && result.data && result.data.tps ? result.data.tps : 0
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbResult })
      } else {
        return responseHandler(result.code)
      }
    })
    .catch(err => {
      __logger.error('Get Profile By Waba Id Error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetWabaProfileStatus
 * @path {get} /business/profile/status
 * @description Bussiness Logic :- This API returns all status of waba profile.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getWabaProfileStatus|getWabaProfileStatus}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of wabaProfileStatusId, statusName in each object.
 * @response {array} metadata.data - Array of all the waba_profile_status with its waba_profile_setup_status_id and status_name.
 * @code {200} if the msg is success than Returns wabaProfileStatusId and statusName.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Danish Galiyara 3rd March, 2021 ***
 */

const getWabaProfileStatus = (req, res) => {
  __logger.info('called funcion to get all wabaProfile status', req.query)
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaStatus()
    .then(dbData => {
      __logger.info('getWabaProfileStatus db Data', dbData)
      if (!req.query || !req.query.wabaProfileStatusId) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
      const mappedStatus = __constants.WABA_STATUS_MAPPING[req.query.wabaProfileStatusId]
      const mappedStatusDataFromDBList = []
      _.each(mappedStatus, status => {
        const statusObj = _.find(dbData, { wabaProfileStatusId: status })
        if (statusObj) mappedStatusDataFromDBList.push(statusObj)
      })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: mappedStatusDataFromDBList })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetCountTemplateAllocated
 * @path {get} /business/profile/template/templateAllocated/:userId
 * @description Bussiness Logic :- This API returns count of template allocated to user using userId.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getCountTemplateAllocated|getCountTemplateAllocated}
 * @param {string}  userId=935043c4-5bbc-4b54-8d2a-a8188a69ef0d - Please provide valid userId here.
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response returns templateAllocated count.
 * @code {200} if the msg is success than Returns templateAllocated.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Javed Khan 22nd January, 2021 ***
 */

const getCountTemplateAllocated = (req, res) => {
  __logger.info('inside function to get template allocated count', req.params)
  const businessAccountService = new BusinessAccountService()
  const validate = new ValidatonService()
  validate.getTemplateAllocated(req.params)
    .then(data => businessAccountService.getCountTempAllocated(req.params.userId))
    .then(dbData => {
      __logger.info('db Data result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetServiceProviderDetails
 * @path {get} /business/getServiceProviderDetails
 * @description Bussiness Logic :- This API returns service provider details.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getServiceProviderDetails|getServiceProviderDetails}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get array of json data consist of serviceProviderId, serviceProviderName in each object.
 * @code {200} if the msg is success than Returns serviceProviderId and serviceProviderName.
 * @author Javed Khan 22nd January, 2021
 * *** Last-Updated :- Javed Khan 22nd January, 2021 ***
 */

const getServiceProviderDetails = (req, res) => {
  __logger.info('called api to get service provider details')
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getServiceProviderData()
    .then(dbData => {
      __logger.info('db result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name toggleChatbot
 * @path {PUT} /business/profile/chatbot
 * @description Bussiness Logic :- This API is used for toggling chatbot on and off.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/updateServiceProviderDetails|UpdateServiceProviderDetails}
 * @body {string} chatBotActivated
 * @body {string} userId
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Returns Service Provider Id in response according to user Id.
 * @code {200} if the msg is success than Returns Service Provider Id.
 * @author Dansish Galiyara 3rd March, 2021
 * *** Last-Updated :- Dansish Galiyara 3rd March, 2021 ***
 */
const toggleChatbot = (req, res) => {
  __logger.info('toggleChatbot Inside toggleChatbot', req.body)
  const callerUserId = req.user && req.user.user_id ? req.user.user_id : 0
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()
  validationService.toggleChatbot(req.body)
    .then(data => businessAccountService.getBusinessProfileInfo(req.body.userId))
    .then(results => {
      __logger.info('toggleChatbot Then 2 waba data', results)
      if (results && results.length > 0) {
        return businessAccountService.toggleChatbot(req.body.userId, callerUserId, results[0], req.body)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(result => {
      __logger.info('toggleChatbot Then 3', result)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name DeleteServiceProvider
 * @path {DELETE} /serviceprovider
 * @description Bussiness Logic :- This API is used to deactive the service provider.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getServiceProviderDetails|getServiceProviderDetails}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success -  Then the service provider is deleted (deactivated).
 * @code {200} if the msg is success than Returns the message as Successfully Deleted.
 * @author Vasim Gujrati, 12 March, 2021
 * *** Last-Updated :- Vasim Gujrati, 12 March, 2021 ***
 */

const deleteServiceProvider = (req, res) => {
  __logger.info('called api to deactivate the Service Provider >>>>> ,req.params', req.params)
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()
  validationService.serviceProviderValidation(req.params)
    .then(validateData => {
      return businessAccountService.getServiceProvider(req.params.serviceProviderId)
    })
    .then(getData => {
      __logger.info('deleteServiceProvider >>>>>>>>>>>> db response getData', getData)
      if (getData && getData[0] && getData[0].serviceProviderId) {
        return businessAccountService.updateServiceProvider(req.params.serviceProviderId, true)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(dbData => {
      __logger.info('delete service provider final response', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('deleteServiceProvider >>>>>>>>> error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name AddUpdateServiceProvider
 * @path {PATCH} /serviceprovider
 * @description Bussiness Logic :- This API is used to add or update the details of service providers.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getServiceProviderDetails|getServiceProviderDetails}
 * @body {string} serviceProviderId
 * @body {string} serviceProviderName
 * @body {number} maxWebsiteAllowed
 <br/><b>Note</b> = At the time of update no need of service Provider id but it is required for update the service provider
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success - Data is added or updated Successfully.
 * @code {200} if the msg is success than Returns serviceProviderId and updation/deletion.
 * @author Vasim Gujrati, 12 March, 2021
 * *** Last-Updated :- Vasim Gujrati, 12 March, 2021 ***
 */

const addUpdateServiceProvider = (req, res) => {
  __logger.info('Api to add/update the Service Provider')
  const businessAccountService = new BusinessAccountService()
  const validationService = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  const serviceProviderId = req && req.body && req.body.serviceProviderId ? req.body.serviceProviderId : '0'
  businessAccountService.getServiceProvider(serviceProviderId, req.body.serviceProviderName || null)
    .then(getQueryResponse => {
      __logger.info('add/update getServiceProvider Details response', getQueryResponse)
      if (req && req.body && req.body.serviceProviderName && getQueryResponse && getQueryResponse[0] && getQueryResponse[0].serviceProviderName && getQueryResponse[0].serviceProviderName === req.body.serviceProviderName) {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Service provider name already exists' })
      } else if (getQueryResponse && getQueryResponse.type && getQueryResponse.type) {
        return validationService.addServiceProvider(req.body, getQueryResponse)
      } else if (getQueryResponse && getQueryResponse[0] && getQueryResponse[0].serviceProviderId) {
        return validationService.updateServiceProvider(req.body)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {} })
      }
    })
    .then(validateData => {
      __logger.info('add/update validateData response', validateData)
      if (validateData && validateData.add) {
        return businessAccountService.addServiceProvider(req.body, userId)
      } else if (validateData && validateData.update) {
        return businessAccountService.updateServiceProvider(serviceProviderId, false, req.body)
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: {} })
      }
    })
    .then(dbData => {
      __logger.info('add/update final response', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('add/update func goes into catch: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetServiceProviderCount
 * @path {get} /business/serviceprovider/count
 * @description Bussiness Logic :- This API returns total service provider count.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/getServiceProviderCount|getServiceProviderCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  -  In response we get object containing the total service provider count .
 * @code {200} If the msg is success than returns totalServiceProvider.
 * @author Arjun Bhole 17th March, 2021
 * *** Last-Updated :- Arjun Bhole 17th March, 2021 ***
 */

const getServiceTotalProviderCount = (req, res) => {
  __logger.info('called api to get total service provider count')
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getServiceTotalProviderCount()
    .then(dbData => {
      __logger.info('db result', dbData)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dbData })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = {
  getBusinessProfile,
  addUpdateBusinessProfile,
  addupdateBusinessAccountInfo,
  markManagerVerified,
  updateServiceProviderDetails,
  updateWabaPhoneNumber,
  addUpdateOptinMessage,
  updateProfilePic,
  updateProfilePicByUrl,
  addUpdateWabaConfiguration,
  getProfileListByStatusId,
  getProfileByWabaId,
  getWabaProfileStatus,
  getCountTemplateAllocated,
  getServiceProviderDetails,
  toggleChatbot,
  deleteServiceProvider,
  addUpdateServiceProvider,
  getServiceTotalProviderCount
}
