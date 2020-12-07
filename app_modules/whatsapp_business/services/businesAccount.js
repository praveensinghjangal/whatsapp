/**
 * @namespace -Whatsapp-Business-Account-(WABA)-Services-
 * @description This Section contains services of whatsapp business account
 *  * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */

const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const saveHistoryData = require('../../../lib/util/saveDataHistory')
const RedisService = require('../../../lib/redis_service/redisService')
const _ = require('lodash')
const HttpService = require('../../../lib/http_service')
const __config = require('../../../config')

class businesAccountService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
    this.http = new HttpService(60000)
  }

  deactivateWabaRecord (wabaInformationId, userId) {
    const recordDeactivated = q.defer()
    __logger.info('Setting is active false to waba record', wabaInformationId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setIsActiveFalseByWabaId(), [wabaInformationId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          recordDeactivated.resolve(true)
        } else {
          recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return recordDeactivated.promise
  }

  checkUserIdExist (userId) {
    __logger.info('checkUserIdExist::>>>>>>>>>>...')
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        __logger.info('valRespons then 1')
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaTableDataByUserId(), [userId])
      })
      .then(result => {
        __logger.info('result then 2')
        // if exist throw return true exist
        if (result && result.length > 0) {
          result[0].canReceiveSms = result[0].canReceiveSms === 1
          result[0].canReceiveVoiceCall = result[0].canReceiveVoiceCall === 1
          result[0].associatedWithIvr = result[0].associatedWithIvr === 1
          result[0].businessManagerVerified = result[0].businessManagerVerified === 1
          doesUserIdExist.resolve({ record: result[0], exists: true })
        } else {
          // else return prmoise to continue the insertiono of data
          doesUserIdExist.resolve({ record: result[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('error in checkUserExistByUserId function: ', err)
        doesUserIdExist.reject(false)
      })
    return doesUserIdExist.promise
  }

  /**
 * @memberof -Whatsapp-Business-Account-(WABA)-Services-
 * @name insertBusinessData
 * @description This service is used to check if record does not exists and then insert waba data .
 * @body {string} userId
 * @body {object} businessData
 * @body {object} businessOldData
 * @response {object} businessAccountObj  -  Object which is inserted in DB.
 * @author Arjun Bhole 3rd June, 2020
 *  * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */
  insertBusinessData (userId, businessData, businessOldData, authToken) {
    __logger.info('insertBusinessData::>>>>>>>>>>...', businessOldData)
    const dataInserted = q.defer()
    __logger.info('Inputs insertBusinessData userId', userId)
    const businessAccountObj = {
      facebookManagerId: businessData.facebookManagerId ? businessData.facebookManagerId : businessOldData.facebookManagerId,
      phoneCode: businessData.phoneCode ? businessData.phoneCode : businessOldData.phoneCode,
      phoneNumber: businessData.phoneNumber ? businessData.phoneNumber : businessOldData.phoneNumber,
      canReceiveSms: typeof businessData.canReceiveSms === 'boolean' ? businessData.canReceiveSms : businessOldData.canReceiveSms,
      canReceiveVoiceCall: typeof businessData.canReceiveVoiceCall === 'boolean' ? businessData.canReceiveVoiceCall : businessOldData.canReceiveVoiceCall,
      associatedWithIvr: typeof businessData.associatedWithIvr === 'boolean' ? businessData.associatedWithIvr : businessOldData.associatedWithIvr,
      businessName: businessData.businessName ? businessData.businessName : businessOldData.businessName,
      whatsappStatus: businessData.whatsappStatus ? businessData.whatsappStatus : businessOldData.whatsappStatus,
      description: businessData.description ? businessData.description : businessOldData.description,
      address: businessData.address ? businessData.address : businessOldData.address,
      state: businessData.state ? businessData.state : businessOldData.state,
      country: businessData.country ? businessData.country : businessOldData.country,
      email: businessData.email ? businessData.email : businessOldData.email,
      businessCategoryId: businessData.businessCategoryId ? businessData.businessCategoryId : businessOldData.businessCategoryId,
      wabaProfileSetupStatusId: businessData.wabaProfileSetupStatusId ? businessData.wabaProfileSetupStatusId : businessOldData.wabaProfileSetupStatusId,
      businessManagerVerified: typeof businessData.businessManagerVerified === 'boolean' ? businessData.businessManagerVerified : businessOldData.businessManagerVerified,
      phoneVerified: typeof businessData.phoneVerified === 'boolean' ? businessData.phoneVerified : businessOldData.phoneVerified,
      wabaInformationId: businessOldData.wabaInformationId ? businessOldData.wabaInformationId : this.uniqueId.uuid(),
      city: businessData.city ? businessData.city : businessOldData.city,
      postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
      serviceProviderId: businessData.serviceProviderId ? businessData.serviceProviderId : businessOldData.serviceProviderId,
      apiKey: businessData.apiKey ? businessData.apiKey : businessOldData.apiKey,
      webhookPostUrl: businessData.webhookPostUrl ? businessData.webhookPostUrl : businessOldData.webhookPostUrl,
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : businessOldData.chatBotActivated || false,
      serviceProviderUserAccountId: businessData.serviceProviderUserAccountId ? businessData.serviceProviderUserAccountId : businessOldData.serviceProviderUserAccountId,
      websites: businessData.websites ? businessData.websites : [],
      accessInfoRejectionReason: businessData.accessInfoRejectionReason ? businessData.accessInfoRejectionReason : businessOldData.accessInfoRejectionReason
    }
    const inputRequest = {
      wabaPhoneNumber: businessAccountObj.phoneCode + businessAccountObj.phoneNumber,
      wabaInformationId: businessAccountObj.wabaInformationId
    }
    __logger.info('InputReuqest::>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..', inputRequest)
    const headers = { Authorization: authToken }
    this.checkWabaNumberAlreadyExist(businessData.phoneCode, businessData.phoneNumber, businessOldData.userId, __constants.TAG.insert)
      .then((data) => {
        __logger.info('checkWabaNumberAlreadyExist Result', { data })
        saveHistoryData(businessOldData, __constants.ENTITY_NAME.WABA_INFORMATION, businessOldData.wabaInformationId, userId)
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addWabaTableData(), [businessAccountObj.facebookManagerId, businessAccountObj.phoneCode, businessAccountObj.phoneNumber, businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webhookPostUrl, businessAccountObj.optinText, businessAccountObj.chatBotActivated, businessAccountObj.serviceProviderUserAccountId, JSON.stringify(businessAccountObj.websites), businessAccountObj.accessInfoRejectionReason])
      })
      .then(result => {
        __logger.info('Insert Result', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          this.addUpdateWabNoMapping(inputRequest, headers)
          dataInserted.resolve(businessAccountObj)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataInserted.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataInserted.promise
  }

  /**
 * @memberof -Whatsapp-Business-Account-(WABA)-Services-
 * @name updateBusinessInfo
 * @description This service is used to check if record exists and then update waba data .
 * @body {string} userId
 * @body {object} businessData
 * @body {object} businessOldData
 * @response {object} businessAccountObj  -  Object which is inserted in DB.
 * @author Arjun Bhole 3rd June, 2020
 *  * *** Last-Updated :- Danish Galiyara 2nd December, 2020 ***
 */
  /* To do the handling of facebook manager id when null  */
  updateBusinessInfo (userId, businessData, businessOldData) {
    const dataUpdated = q.defer()
    __logger.info('Inputs updateBusinessInfo userId', userId)
    // __logger.info('Inputs insertBusinessData facebook manager id old', businessOldData.facebookManagerId)
    // __logger.info('Inputs insertBusinessData facebook manager id new', businessData.facebookManagerId)
    saveHistoryData(businessOldData, __constants.ENTITY_NAME.WABA_INFORMATION, businessOldData.wabaInformationId, userId)
    const businessAccountObj = {
      facebookManagerId: typeof businessData.facebookManagerId === 'string' ? businessData.facebookManagerId : businessOldData.facebookManagerId,
      phoneCode: businessData.phoneCode ? businessData.phoneCode : businessOldData.phoneCode,
      phoneNumber: businessOldData.phoneNumber,
      canReceiveSms: typeof businessData.canReceiveSms === 'boolean' ? businessData.canReceiveSms : businessOldData.canReceiveSms,
      canReceiveVoiceCall: typeof businessData.canReceiveVoiceCall === 'boolean' ? businessData.canReceiveVoiceCall : businessOldData.canReceiveVoiceCall,
      associatedWithIvr: typeof businessData.associatedWithIvr === 'boolean' ? businessData.associatedWithIvr : businessOldData.associatedWithIvr,
      businessName: businessData.businessName ? businessData.businessName : businessOldData.businessName,
      whatsappStatus: businessData.whatsappStatus ? businessData.whatsappStatus : businessOldData.whatsappStatus,
      description: businessData.description ? businessData.description : businessOldData.description,
      address: businessData.address ? businessData.address : businessOldData.address,
      state: businessData.state ? businessData.state : businessOldData.state,
      country: businessData.country ? businessData.country : businessOldData.country,
      email: businessData.email ? businessData.email : businessOldData.email,
      businessCategoryId: businessData.businessCategoryId ? businessData.businessCategoryId : businessOldData.businessCategoryId,
      wabaProfileSetupStatusId: businessData.wabaProfileSetupStatusId ? businessData.wabaProfileSetupStatusId : businessOldData.wabaProfileSetupStatusId,
      businessManagerVerified: typeof businessData.businessManagerVerified === 'boolean' ? businessData.businessManagerVerified : businessOldData.businessManagerVerified,
      phoneVerified: typeof businessData.phoneVerified === 'boolean' ? businessData.phoneVerified : businessOldData.phoneVerified,
      wabaInformationId: businessOldData.wabaInformationId ? businessOldData.wabaInformationId : this.uniqueId.uuid(),
      city: businessData.city ? businessData.city : businessOldData.city,
      postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
      serviceProviderId: businessData.serviceProviderId ? businessData.serviceProviderId : businessOldData.serviceProviderId,
      apiKey: businessData.apiKey ? businessData.apiKey : businessOldData.apiKey,
      webhookPostUrl: businessData.webhookPostUrl ? businessData.webhookPostUrl : (businessData.webhookPostUrl === '' ? null : businessOldData.webhookPostUrl),
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : businessOldData.chatBotActivated || false,
      serviceProviderUserAccountId: businessData.serviceProviderUserAccountId ? businessData.serviceProviderUserAccountId : businessOldData.serviceProviderUserAccountId,
      websites: businessData.websites ? businessData.websites : businessOldData.websites,
      imageData: businessData.imageData ? businessData.imageData : businessOldData.imageData,
      accessInfoRejectionReason: businessData.accessInfoRejectionReason ? businessData.accessInfoRejectionReason : null,
      templatesAllowed: businessData.templatesAllowed ? businessData.templatesAllowed : businessOldData.templatesAllowed
    }
    const redisService = new RedisService()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabaTableData(), [businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.facebookManagerId, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webhookPostUrl, businessAccountObj.optinText, businessAccountObj.chatBotActivated, businessAccountObj.serviceProviderUserAccountId, JSON.stringify(businessAccountObj.websites), businessAccountObj.imageData, businessAccountObj.accessInfoRejectionReason, businessAccountObj.templatesAllowed, businessAccountObj.wabaInformationId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          if (businessAccountObj.phoneNumber) redisService.setDataInRedis(businessAccountObj.phoneNumber)
          dataUpdated.resolve(businessAccountObj)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  updateBusinessData (businessData, businessOldData, authToken) {
    __logger.info('Inputs updateBusinessData userId')
    const businessDataUpdated = q.defer()
    if (businessData && businessData.wabaProfileSetupStatusId && businessData.wabaProfileSetupStatusId !== __constants.WABA_PROFILE_STATUS.rejected.statusCode) {
      businessData.accessInfoRejectionReason = null
    }
    if (businessData && businessData.facebookManagerId && businessData.facebookManagerId !== businessOldData.facebookManagerId) {
      businessData.businessManagerVerified = false
      businessData.wabaProfileSetupStatusId = __constants.WABA_PROFILE_STATUS.profileIncomplete.statusCode
    }
    // this.deactivateWabaRecord(businessOldData.wabaInformationId, businessOldData.userId)
    // .then(data => this.insertBusinessData(businessOldData.userId, businessData, businessOldData))
    if ((businessData && businessData.phoneNumber && !businessOldData.phoneNumber) || (businessData && businessData.phoneNumber && businessData.phoneNumber !== businessOldData.phoneNumber)) {
      this.checkWabaNumberAlreadyExist(businessData.phoneCode, businessData.phoneNumber, businessOldData.userId, __constants.TAG.update)
        .then(() => this.updateWabaNumberAndPhoneCode(businessOldData.userId, businessData.phoneCode, businessData.phoneNumber, businessOldData.wabaProfileSetupStatusId, businessOldData.wabaInformationId, authToken))
        .then(() => this.processWabaDataUpdation(businessOldData.userId, businessData, businessOldData))
        .then(data => businessDataUpdated.resolve(data))
        .catch(err => businessDataUpdated.reject(err))
    } else {
      this.processWabaDataUpdation(businessOldData.userId, businessData, businessOldData)
        .then(data => businessDataUpdated.resolve(data))
        .catch(err => businessDataUpdated.reject(err))
    }
    return businessDataUpdated.promise
  }

  processWabaDataUpdation (userId, businessData, businessOldData) {
    __logger.info('processWabaDataUpdation')
    const processed = q.defer()
    this.updateBusinessInfo(userId, businessData, businessOldData)
      .then(insertedData => processed.resolve(insertedData))
      .catch(err => {
        __logger.error('error: ', err)
        processed.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return processed.promise
  }

  getBusinessProfileInfo (userId) {
    __logger.info('getBusinessProfileInfo')
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBusinessProfile(), [userId])
      .then(businessData => businessDataFetched.resolve(businessData))
      .catch(err => {
        __logger.error('error: ', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  updateServiceProviderId (userId, serviceProviderId) {
    __logger.info('updateServiceProviderId')
    const dataUpdated = q.defer()
    const serviceProviderData = {
      serviceProviderId: serviceProviderId,
      updatedBy: userId,
      userId: userId
    }
    const queryParam = []
    _.each(serviceProviderData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateServiceProviderId(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          delete serviceProviderData.updatedBy
          delete serviceProviderData.userId
          dataUpdated.resolve(serviceProviderData)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getUserIdFromWabaNumber (wabaNumber) {
    __logger.info('getUserIdFromWabaNumber')
    let phoneCode
    if (wabaNumber.includes('91')) {
      phoneCode = wabaNumber.substring(0, 2)
      wabaNumber = wabaNumber.substring(2, wabaNumber.length)
    }
    if (wabaNumber.includes('+91')) {
      phoneCode = wabaNumber.substring(0, 3)
      wabaNumber = wabaNumber.substring(3, wabaNumber.length)
    }
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdFromWabaNumber(), [wabaNumber, phoneCode])
      .then(businessData => {
        __logger.info('BusinessData', { businessData })
        if (businessData.length > 0) {
          businessDataFetched.resolve(businessData[0].userId)
        } else {
          businessDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  getWabaDataFromDb (wabaNumber) {
    __logger.info('Inside getWabaDataFromDb :: ', wabaNumber)
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaData(), [wabaNumber])
      .then(result => {
        // __logger.info('resulttttttttttttttttttttttttttt', result[0], wabaNumber)
        if (result && result.length === 0) {
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS, err: {} })
        } else {
          dbData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('error in get getDataFromDb: ', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  checkWabaNumberAlreadyExist (phoneCode, phoneNumber, userId, tag) {
    __logger.info('Inside checkWabaNumberAlreadyExist :: ')
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.checkWabaNumberAlreadyExist(), [phoneCode, phoneNumber, userId])
      .then(result => {
        __logger.info('Inside checkWabaNumberAlreadyExist result :: ')
        if (result && result.length === 0 && tag === __constants.TAG.insert) {
          dbData.resolve(true)
        }
        if (result && result.length === 0 && tag === __constants.TAG.update) {
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {}, err: {} })
        } else {
          const userIdArr = result.map(el => el.userId)
          // const phoneCodeArr = result.map(el => el.phoneCode)
          const phoneNumberArr = result.map(el => el.phoneNumber)
          if (phoneNumberArr.includes(phoneNumber)) {
            dbData.reject({ type: __constants.RESPONSE_MESSAGES.RECORD_EXIST, data: {}, err: {} })
          } else if (userIdArr.includes(userId)) {
            dbData.resolve(true)
          }
        }
      })
      .catch(err => {
        __logger.error('error in get getDataFromDb: ', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  updateWabaNumberAndPhoneCode (userId, phoneCode, phoneNumber, wabaProfileSetupStatusId, wabaInformationId, authToken) {
    __logger.info('updateWabaNumberAndPhoneCode::>>>>>>>>>>>>>.')
    /* To do
       Update all the tables with waba Number
       currently updating only waba info table
    */
    const dataUpdated = q.defer()
    const inputRequest = {
      wabaPhoneNumber: phoneCode + phoneNumber,
      wabaInformationId: wabaInformationId
    }
    const headers = { Authorization: authToken }
    if (wabaProfileSetupStatusId && (wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.submitted.statusCode || wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode || wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode)) {
      dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PROFILE_STATUS_CANNOT_BE_UPDATED, data: {}, err: {} })
    }
    const wabaData = {
      phoneCode,
      phoneNumber,
      updatedBy: userId,
      userId
    }
    const queryParam = []
    _.each(wabaData, (val) => queryParam.push(val))
    const validationService = new ValidatonService()
    validationService.checkPhoneCodeAndPhoneNumberService(wabaData)
      .then(() => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabaPhoneNumberAndPhoneCodeByWabaIdAndUserId(), queryParam))
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          this.addUpdateWabNoMapping(inputRequest, headers)
          delete wabaData.updatedBy
          delete wabaData.wabaInformationId
          delete wabaData.userId
          dataUpdated.resolve(wabaData)
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getWabaNumberFromUserId (userId) {
    __logger.info('getWabaNumberFromUserId::>>>>>>>>>>>>>.')
    const wabaNumber = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberFromUserId(), [userId])
      .then(result => {
        if (result && result.length === 0) {
          wabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          wabaNumber.resolve(result[0])
        }
      }).catch(err => {
        __logger.error('error::getWabaNumberFromUserId : ', err)
        wabaNumber.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return wabaNumber.promise
  }

  getUserIdAndTokenKeyByWabaNumber (wabaNumber) {
    __logger.info('getUserIdAndTokenKeyByWabaNumber::>>>>>>>>>>>>>.')
    let phoneCode
    if (wabaNumber.includes('91')) {
      phoneCode = wabaNumber.substring(0, 2)
      wabaNumber = wabaNumber.substring(2, wabaNumber.length)
    }
    if (wabaNumber.includes('+91')) {
      phoneCode = wabaNumber.substring(0, 3)
      wabaNumber = wabaNumber.substring(3, wabaNumber.length)
    }
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdAndTokenKeyByWabaNumber(), [wabaNumber, phoneCode])
      .then(businessData => {
        __logger.info('BusinessData', { businessData })
        if (businessData.length > 0) {
          businessDataFetched.resolve(businessData[0])
        } else {
          businessDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  getWabaNumberAndOptinTextFromUserId (userId) {
    __logger.info('getWabaNumberAndOptinTextFromUserId::>>>>>..')
    const wabaNumberAndOptinTextFetched = q.defer()
    const validationService = new ValidatonService()

    validationService.checkUserIdService({ userId: userId })
      .then(() => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberAndOptinTextFromUserId(), [userId]))
      .then(result => {
        if (result && result.length === 0) {
          wabaNumberAndOptinTextFetched.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          wabaNumberAndOptinTextFetched.resolve(result[0])
        }
      }).catch(err => {
        __logger.error('error::getWabaNumberAndOptinTextFromUserId : ', err)
        wabaNumberAndOptinTextFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return wabaNumberAndOptinTextFetched.promise
  }

  getWebsiteLimitByProviderId (serviceProviderId) {
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWebsiteLimit(), [serviceProviderId])
      .then(businessData => businessDataFetched.resolve(businessData))
      .catch(err => {
        __logger.error('error: ', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  addUpdateWabNoMapping (inputRequest, headers) {
    __logger.info('addUpdateWabNoMapping::>>>>>>>>>>>>>', inputRequest, headers)
    const wabaNumberMappingResult = q.defer()
    this.http = new HttpService(60000)
    this.http.Post(inputRequest, 'body', __config.base_url + __constants.INTERNAL_END_POINTS.addUpdateWabNoMapping, headers)
      .then(apiRes => {
        __logger.info('addUpdateWabNoMapping api response', apiRes)
        wabaNumberMappingResult.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
      })
      .catch(err => wabaNumberMappingResult.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return wabaNumberMappingResult.promise
  }
}

module.exports = businesAccountService
