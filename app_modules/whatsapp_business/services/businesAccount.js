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
const e164 = require('e164')
const csc = require('country-state-city').default

class businesAccountService {
  constructor () {
    __logger.warn('businessAccount: businessAccountService class inititated ...')
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  deactivateWabaRecord (wabaInformationId, userId) {
    const recordDeactivated = q.defer()
    __logger.info('businessAccount: deactivateWabaRecord(): Setting is active false to waba record: ', wabaInformationId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setIsActiveFalseByWabaId(), [wabaInformationId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          recordDeactivated.resolve(true)
        } else {
          __logger.info('businessAccount: deactivateWabaRecord(): if/else: DB Query :: Reject ::', wabaInformationId, userId)
          recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: deactivateWabaRecord(): catch:', err)
        recordDeactivated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return recordDeactivated.promise
  }

  checkUserIdExist (userId) {
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is provided or not
    this.validate.checkUserIdService({ userId })
      // then using a query to check that a record exist or not in table
      .then(valResponse => {
        __logger.info('businessAccount: checkUserIdExist(): checkUserIdService: then 1: Validated Successfully.')
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaTableDataByUserId(), [userId])
      })
      .then(result => {
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
        __logger.info('businessAccount: checkUserIdExist(): catch:', err)
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
     *  * *** Last-Updated :- Arjun Bhole 8th December, 2020 ***
     */
  insertBusinessData (userId, businessData, businessOldData) {
    const dataInserted = q.defer()
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
      audienceWebhookUrl: businessData.audienceWebhookUrl ? businessData.audienceWebhookUrl : businessOldData.audienceWebhookUrl,
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      optoutText: businessData.optoutText ? businessData.optoutText : (businessOldData.optoutText ? businessOldData.optoutText : __constants.OPTOUT_TEXT),
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : businessOldData.chatBotActivated || false,
      serviceProviderUserAccountId: businessData.serviceProviderUserAccountId ? businessData.serviceProviderUserAccountId : businessOldData.serviceProviderUserAccountId,
      websites: businessData.websites ? businessData.websites : [],
      accessInfoRejectionReason: businessData.accessInfoRejectionReason ? businessData.accessInfoRejectionReason : businessOldData.accessInfoRejectionReason
    }
    this.checkWabaNumberAlreadyExist(businessData.phoneCode, businessData.phoneNumber, businessOldData.userId, __constants.TAG.insert)
      .then((data) => {
        saveHistoryData(businessOldData, __constants.ENTITY_NAME.WABA_INFORMATION, businessOldData.wabaInformationId, userId)
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addWabaTableData(), [businessAccountObj.facebookManagerId, businessAccountObj.phoneCode, businessAccountObj.phoneNumber, businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webhookPostUrl, businessAccountObj.audienceWebhookUrl, businessAccountObj.optinText, businessAccountObj.optoutText, businessAccountObj.chatBotActivated, businessAccountObj.serviceProviderUserAccountId, JSON.stringify(businessAccountObj.websites), businessAccountObj.accessInfoRejectionReason, userId])
      })
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataInserted.resolve(businessAccountObj)
        } else {
          __logger.error('businessAccount: insertBusinessData(): checkWabaNumberAlreadyExist(): if/else :: Reject ::', result)
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: insertBusinessData(): checkWabaNumberAlreadyExist(): catch:', err)
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
  updateBusinessInfo (userId, businessData, businessOldData, recordUpdatingUserId = businessOldData.userId) {
    const dataUpdated = q.defer()
    saveHistoryData(businessOldData, __constants.ENTITY_NAME.WABA_INFORMATION, businessOldData.wabaInformationId, recordUpdatingUserId)
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
      audienceWebhookUrl: businessData.audienceWebhookUrl ? businessData.audienceWebhookUrl : (businessData.audienceWebhookUrl === '' ? null : businessOldData.audienceWebhookUrl),
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      optoutText: businessData.optoutText ? businessData.optoutText : businessOldData.optoutText,
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : businessOldData.chatBotActivated || false,
      serviceProviderUserAccountId: businessData.serviceProviderUserAccountId ? businessData.serviceProviderUserAccountId : businessOldData.serviceProviderUserAccountId,
      websites: businessData.websites ? businessData.websites : businessOldData.websites,
      imageData: businessData.imageData ? businessData.imageData : businessOldData.imageData,
      accessInfoRejectionReason: businessData.accessInfoRejectionReason ? businessData.accessInfoRejectionReason : null,
      templatesAllowed: businessData.templatesAllowed ? businessData.templatesAllowed : businessOldData.templatesAllowed,
      maxTpsToProvider: businessData.maxTpsToProvider ? businessData.maxTpsToProvider : businessOldData.maxTpsToProvider
    }
    const redisService = new RedisService()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabaTableData(), [businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, recordUpdatingUserId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.facebookManagerId, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webhookPostUrl, businessAccountObj.audienceWebhookUrl, businessAccountObj.optinText, businessAccountObj.optoutText, businessAccountObj.chatBotActivated, businessAccountObj.serviceProviderUserAccountId, JSON.stringify(businessAccountObj.websites), businessAccountObj.imageData, businessAccountObj.accessInfoRejectionReason, businessAccountObj.templatesAllowed, businessAccountObj.maxTpsToProvider, businessAccountObj.wabaInformationId, userId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          if (businessAccountObj.phoneNumber) redisService.setDataInRedis(businessAccountObj.phoneNumber)
          dataUpdated.resolve(businessAccountObj)
        } else {
          __logger.error('businessAccount: updateBusinessInfo(): DB Query: if/else :: Reject ::', result)
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: updateBusinessInfo(): DB Query :: catch ::', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  updateBusinessData (businessData, businessOldData, recordUpdatingUserId = businessOldData.userId) {
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
        .then(() => this.updateWabaNumberAndPhoneCode(businessOldData.userId, businessData.phoneCode, businessData.phoneNumber, businessOldData.wabaProfileSetupStatusId, businessOldData.wabaInformationId))
        .then(() => this.processWabaDataUpdation(businessOldData.userId, businessData, businessOldData, recordUpdatingUserId))
        .then(data => {
          __db.redis.key_delete(businessOldData.userId)
          businessDataUpdated.resolve(data)
        })
        .catch(err => {
          __logger.error('businessAccount: updateBusinessData(): checkWabaNumberAlreadyExist(): catch:', err)
          businessDataUpdated.reject(err)
        })
    } else {
      this.processWabaDataUpdation(businessOldData.userId, businessData, businessOldData, recordUpdatingUserId)
        .then(data => {
          __db.redis.key_delete(businessOldData.userId)
          return businessDataUpdated.resolve(data)
        })
        .catch(err => {
          __logger.error('businessAccount: updateBusinessData(): checkWabaNumberAlreadyExist(): if/else: catch:', err)
          businessDataUpdated.reject(err)
        })
    }
    return businessDataUpdated.promise
  }

  processWabaDataUpdation (userId, businessData, businessOldData, recordUpdatingUserId = businessOldData.userId) {
    const processed = q.defer()
    this.updateBusinessInfo(userId, businessData, businessOldData, recordUpdatingUserId)
      .then(insertedData => processed.resolve(insertedData))
      .catch(err => {
        __logger.error('businessAccount: processWabaDataUpdation(): updateBusinessInfo(): catch:', err)
        processed.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return processed.promise
  }

  getBusinessProfileInfo (userId) {
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBusinessProfile(), [userId])
      .then(businessData => businessDataFetched.resolve(businessData))
      .catch(err => {
        __logger.error('businessAccount: getBusinessProfileInfo(): DB Query: catch:', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  updateServiceProviderDetails (userId, callerUserId, serviceProviderOldData, serviceProviderNewData) {
    const dataUpdated = q.defer()
    const serviceProviderData = {
      serviceProviderId: serviceProviderNewData.serviceProviderId ? serviceProviderNewData.serviceProviderId : serviceProviderOldData.serviceProviderId,
      apiKey: serviceProviderNewData.apiKey ? serviceProviderNewData.apiKey : serviceProviderOldData.apiKey,
      serviceProviderUserAccountId: serviceProviderNewData.serviceProviderUserAccountId ? serviceProviderNewData.serviceProviderUserAccountId : serviceProviderOldData.serviceProviderUserAccountId,
      maxTpsToProvider: serviceProviderNewData.maxTpsToProvider,
      updatedBy: callerUserId,
      userId: userId
    }
    const queryParam = []
    _.each(serviceProviderData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateServiceProviderDetails(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          saveHistoryData(serviceProviderOldData, __constants.ENTITY_NAME.WABA_INFORMATION, serviceProviderOldData.wabaInformationId, callerUserId)
          delete serviceProviderData.updatedBy
          dataUpdated.resolve(serviceProviderData)
        } else {
          __logger.error('businessAccount: updateServiceProviderDetails(): DB Query: if/else :: Reject :: ', userId, callerUserId, serviceProviderOldData, serviceProviderNewData)
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: updateServiceProviderDetails(): catch: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getUserIdFromWabaNumber (wabaNumber) {
    const countryNumDetails = e164.lookup(wabaNumber)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = wabaNumber.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    wabaNumber = wabaNumber.substring(phoneCode.length, wabaNumber.length)
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdFromWabaNumber(), [wabaNumber, phoneCode])
      .then(businessData => {
        if (businessData.length > 0) {
          businessDataFetched.resolve(businessData[0].userId)
        } else {
          __logger.error('businessAccount: getUserIdFromWabaNumber(): if/else :: Reject ::', businessData)
          businessDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, err: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getUserIdFromWabaNumber(): Qb Query: catch:', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  getWabaDataFromDb (wabaNumber) {
    __logger.info('businesAccount: getWabaDataFromDb(' + wabaNumber + '): called')
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaData(), [wabaNumber])
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getWabaDataFromDb(' + wabaNumber + '): Qb Query: if/else :: Reject ::', { result })
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS, err: {} })
        } else {
          dbData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getWabaDataFromDb(' + wabaNumber + '): Qb Query: catch:', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  checkWabaNumberAlreadyExist (phoneCode, phoneNumber, userId, tag) {
    __logger.info('businesAccount: checkWabaNumberAlreadyExist(): called')
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.checkWabaNumberAlreadyExist(), [phoneCode, phoneNumber, userId])
      .then(result => {
        if (result && result.length === 0 && tag === __constants.TAG.insert) {
          dbData.resolve(true)
        }
        if (result && result.length === 0 && tag === __constants.TAG.update) {
          __logger.error('businessAccount: checkWabaNumberAlreadyExist(): Qb Query: if/else :: Reject ::', result)
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
        __logger.error('businessAccount: checkWabaNumberAlreadyExist(): Qb Query: catch:', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  updateWabaNumberAndPhoneCode (userId, phoneCode, phoneNumber, wabaProfileSetupStatusId, wabaInformationId) {
    __logger.info('updateWabaNumberAndPhoneCode::>>>>>>>>>>>>>.')
    /* To do
      Update all the tables with waba Number
      currently updating only waba info table
    */
    const dataUpdated = q.defer()
    if (wabaProfileSetupStatusId && (wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.submitted.statusCode || wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.pendingForApproval.statusCode || wabaProfileSetupStatusId === __constants.WABA_PROFILE_STATUS.accepted.statusCode)) {
      __logger.error('businessAccount: checkWabaNumberAlreadyExist(): wabaProfileSetupStatus is either in submitted, pendingForApproval, accepted:', wabaProfileSetupStatusId)
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
          delete wabaData.updatedBy
          delete wabaData.wabaInformationId
          delete wabaData.userId
          dataUpdated.resolve(wabaData)
        } else {
          __logger.error('businessAccount: updateWabaNumberAndPhoneCode(): checkPhoneCodeAndPhoneNumberService(): if/else :: Reject ::', result)
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: updateWabaNumberAndPhoneCode(): checkPhoneCodeAndPhoneNumberService(): catch:', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getWabaNumberFromUserId (userId) {
    const wabaNumber = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberFromUserId(), [userId])
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getWabaNumberFromUserId(): Db Query: Reject:', result)
          wabaNumber.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          wabaNumber.resolve(result[0])
        }
      }).catch(err => {
        __logger.error('businessAccount: getWabaNumberFromUserId(): catch:', err)
        wabaNumber.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return wabaNumber.promise
  }

  getUserIdAndTokenKeyByWabaNumber (wabaNumber) {
    // let phoneCode
    // if (wabaNumber.includes('91')) {
    //   phoneCode = wabaNumber.substring(0, 2)
    //   wabaNumber = wabaNumber.substring(2, wabaNumber.length)
    // }
    // if (wabaNumber.includes('+91')) {
    //   phoneCode = wabaNumber.substring(0, 3)
    //   wabaNumber = wabaNumber.substring(3, wabaNumber.length)
    // }
    const countryNumDetails = e164.lookup(wabaNumber)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = wabaNumber.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    wabaNumber = wabaNumber.substring(phoneCode.length, wabaNumber.length)
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getUserIdAndTokenKeyByWabaNumber(), [wabaNumber, phoneCode])
      .then(businessData => {
        __logger.info('businessAccount: getUserIdAndTokenKeyByWabaNumber(' + wabaNumber + '): Db Query:', businessData)
        if (businessData.length > 0) {
          businessDataFetched.resolve(businessData[0])
        } else {
          __logger.error('businessAccount: getUserIdAndTokenKeyByWabaNumber(' + wabaNumber + ') :: Reject ::', businessData)
          businessDataFetched.reject({ type: __constants.RESPONSE_MESSAGES.USER_ID_NOT_EXIST, err: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getUserIdAndTokenKeyByWabaNumber(' + wabaNumber + '): catch:', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  getWabaNumberAndOptinTextFromUserId (userId) {
    const wabaNumberAndOptinTextFetched = q.defer()
    const validationService = new ValidatonService()

    validationService.checkUserIdService({ userId: userId })
      .then(() => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaNumberAndOptinTextFromUserId(), [userId]))
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getWabaNumberAndOptinTextFromUserId(' + userId + '): Db Query :: Reject ::', result)
          wabaNumberAndOptinTextFetched.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          wabaNumberAndOptinTextFetched.resolve(result[0])
        }
      }).catch(err => {
        __logger.error('businessAccount: getWabaNumberAndOptinTextFromUserId(' + userId + '): catch:', err)
        wabaNumberAndOptinTextFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return wabaNumberAndOptinTextFetched.promise
  }

  getWebsiteLimitByProviderId (serviceProviderId) {
    const businessDataFetched = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWebsiteLimit(), [serviceProviderId])
      .then(businessData => businessDataFetched.resolve(businessData))
      .catch(err => {
        __logger.error('businessAccount: getWebsiteLimitByProviderId(' + serviceProviderId + '): catch:', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }

  getServiceProviderDetailsByUserId (userId) {
    const serviceProviderData = q.defer()
    this.validate.checkUserIdService({ userId })
      .then(valResponse => {
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getServiceProviderDetailsByUserId(), [userId])
      })
      .then(result => {
        __logger.error('businessAccount: getServiceProviderDetailsByUserId(' + userId + '):  then 2: result:', result)
        if (result && result.length > 0) {
          return serviceProviderData.resolve({ record: result[0], exists: true })
        } else {
          return serviceProviderData.resolve({ record: result[0], exists: false })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getServiceProviderDetailsByUserId(' + userId + '):  catch:', err)
        serviceProviderData.reject(false)
      })
    return serviceProviderData.promise
  }

  getBusinessProfileListByStatusId (columnArray, offset, ItemsPerPage, valArray) {
    const status = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBusinessProfileListByStatusId(columnArray), [...valArray, ItemsPerPage, offset])
      .then(result => {
        if (result && result[0] && result[0].length && result[0].length > 0) {
          status.resolve(result)
        } else {
          __logger.error('businessAccount: getBusinessProfileListByStatusId(): Db Query: Reject ::', result)
          status.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        }
      }).catch(err => {
        __logger.error('businessAccount: getBusinessProfileListByStatusId(): Db Query: catch:', err)
        status.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return status.promise
  }

  getProfileDataByWabaId (wabaId) {
    const status = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getProfileByWabaId(), [wabaId])
      .then(result => {
        if (result && result.length === 0) {
          status.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        } else {
          __logger.error('businessAccount: getProfileDataByWabaId(' + wabaId + '): Db Query: Reject ::', result)
          status.resolve(result)
        }
      }).catch(err => {
        __logger.error('businessAccount: getProfileDataByWabaId(' + wabaId + '): Db Query: catch:', err)
        status.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return status.promise
  }

  getWabaStatus () {
    __logger.error('businessAccount: getWabaStatus()')
    const status = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaStatus(), [])
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getWabaStatus(): Reject ::', result)
          status.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        } else {
          status.resolve(result)
        }
      }).catch(err => {
        __logger.error('businessAccount: getWabaStatus(): catch:', err)
        status.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return status.promise
  }

  getCountTempAllocated (userId) {
    const status = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateAllocatedCount(), [userId])
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getCountTempAllocated(' + userId + '): Reject ::', result)
          status.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        } else {
          status.resolve(result[0])
        }
      }).catch(err => {
        __logger.error('businessAccount: getCountTempAllocated(' + userId + '): catch:', err)
        status.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return status.promise
  }

  getServiceProviderData () {
    const providerDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getServiceProviderData(), [])
      .then(result => {
        if (result && result.length === 0) {
          __logger.error('businessAccount: getCountTempAllocated(): Reject ::', result)
          providerDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        } else {
          providerDetails.resolve(result)
        }
      }).catch(err => {
        __logger.error('businessAccount: getCountTempAllocated(): catch:', err)
        providerDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return providerDetails.promise
  }

  toggleChatbot (userId, callerUserId, wabaOldData, chatBotData) {
    const dataUpdated = q.defer()
    const serviceProviderData = {
      chatbotActivated: chatBotData.chatBotActivated !== undefined ? chatBotData.chatBotActivated : wabaOldData.chatBotActivated,
      updatedBy: callerUserId,
      userId: userId
    }
    const queryParam = []
    _.each(serviceProviderData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.toggleChatbot(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          saveHistoryData(wabaOldData, __constants.ENTITY_NAME.WABA_INFORMATION, wabaOldData.wabaInformationId, callerUserId)
          delete serviceProviderData.updatedBy
          dataUpdated.resolve(serviceProviderData)
        } else {
          __logger.error('businessAccount: toggleChatbot(' + userId + '): Reject ::', result)
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: toggleChatbot(' + userId + '): catch:', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getWabaAccountActiveInactiveCount () {
    __logger.info('businessAccount: getWabaAccountActiveInactiveCount():')
    const dbData = q.defer()
    let res
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.getWabaAccountActiveInactiveCount(), [])
      .then(result => {
        __logger.info('businessAccount: getWabaAccountActiveInactiveCount(): Db Query: ', result)
        if (result && result.length === 0) {
          __logger.error('businessAccount: getWabaAccountActiveInactiveCount(): Db Query: Reject ::', result)
          return dbData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          res = result
          return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTotalUser(), [])
        }
      })
      .then((response) => {
        if (response && response[0] && response[0].totalUsers) {
          res.push(response[0])
        }
        dbData.resolve(res)
      })
      .catch(err => {
        __logger.error('businessAccount: getWabaAccountActiveInactiveCount(): catch:', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  getWabaStatusCount () {
    __logger.info('businessAccount: getWabaStatusCount():')
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaStatusCount(), [])
      .then(result => {
        __logger.info('businessAccount: getWabaStatusCount(): count:', result)
        if (result && result.length === 0) {
          __logger.info('businessAccount: getWabaStatusCount(): Reject ::', result)
          dbData.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {} })
        } else {
          dbData.resolve(result)
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getWabaStatusCount(): catch:', err)
        dbData.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  getServiceProvider (serviceProviderId, serviceProviderName) {
    const providerDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getServiceProvider(), [serviceProviderId, serviceProviderName])
      .then(result => {
        if (result && result.length === 0) {
          providerDetails.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
        } else {
          providerDetails.resolve(result)
        }
      }).catch(err => {
        __logger.error('businessAccount: serviceProviderId(): catch:', err)
        providerDetails.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return providerDetails.promise
  }

  addServiceProvider (requestBody, userId) {
    const serviceProviderAdded = q.defer()
    const serviceProviderId = this.uniqueId.uuid()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.insertServiceProviderData(), [serviceProviderId, requestBody.serviceProviderName, userId, requestBody.maxWebsiteAllowed, userId])
      .then(result => {
        __logger.info('businessAccount: addServiceProvider(): then 1:', result)
        if (result && result.affectedRows && result.affectedRows > 0) {
          serviceProviderAdded.resolve({ serviceProvider: 'added', serviceProviderId })
        } else {
          __logger.error('businessAccount: addServiceProvider(): catch:', result)
          serviceProviderAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => serviceProviderAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
    return serviceProviderAdded.promise
  }

  updateServiceProvider (serviceProviderId, checkForDeactivation, remainingValue) {
    const columnArray = []
    const queryParam = []
    const dataUpdated = q.defer()

    if (checkForDeactivation) {
      columnArray.push('is_active')
      queryParam.push(0)
    } else {
      if (remainingValue.serviceProviderName) {
        columnArray.push('service_provider_name')
        queryParam.push(remainingValue.serviceProviderName)
      }
      if (remainingValue.maxWebsiteAllowed) {
        columnArray.push('max_website_allowed')
        queryParam.push(remainingValue.maxWebsiteAllowed)
      }
    }
    queryParam.push(serviceProviderId)
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateServiceProviderData(checkForDeactivation, columnArray), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataUpdated.resolve({ serviceProvider: 'updated', serviceProviderId })
        } else {
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: updateServiceProvider(): catch:', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  getServiceTotalProviderCount () {
    const dbData = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getServiceTotalProviderCount(), [])
      .then(result => {
        __logger.info('businessAccount: getServiceTotalProviderCount(): Db Query Result:', result)
        if (result && result.length && result.length === 0) {
          dbData.resolve(true)
        } else {
          dbData.resolve(result[0])
        }
      })
      .catch(err => {
        __logger.error('businessAccount: getServiceTotalProviderCount(): catch:', err)
        dbData.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dbData.promise
  }

  updateWabizApiKeyAndExpireyTime (wabaNumber, apiKey, expireyTime, userId) {
    __logger.info('businessAccount: updateWabizApiKeyAndExpireyTime(): ::::: Updating Wabiz API Key ::::: ', wabaNumber, expireyTime)
    const dataUpdated = q.defer()
    // let phoneCode = ''
    // if (wabaNumber.includes('91')) {
    //   phoneCode = wabaNumber.substring(0, 2)
    //   wabaNumber = wabaNumber.substring(2, wabaNumber.length)
    // }
    // if (wabaNumber.includes('+91')) {
    //   phoneCode = wabaNumber.substring(0, 3)
    //   wabaNumber = wabaNumber.substring(3, wabaNumber.length)
    // }
    const countryNumDetails = e164.lookup(wabaNumber)
    const countryDetails = countryNumDetails && countryNumDetails.code ? csc.getCountryByCode(countryNumDetails.code.toUpperCase()) : {}
    const phoneCode = wabaNumber.includes('+') ? '+' + countryDetails.phonecode : countryDetails.phonecode
    wabaNumber = wabaNumber.substring(phoneCode.length, wabaNumber.length)
    const wabizData = { apiKey, expireyTime, phoneCode, wabaNumber }
    const queryParam = []
    _.each(wabizData, (val) => queryParam.push(val))
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabizApiKeyAndExpireyTime(), queryParam)
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          saveHistoryData(wabizData, __constants.ENTITY_NAME.WABA_INFORMATION, phoneCode + wabaNumber, userId)
          __db.redis.key_delete(phoneCode + wabaNumber)
          dataUpdated.resolve(true)
        } else {
          __logger.error('businessAccount: updateWabizApiKeyAndExpireyTime(): ::::: Error while Updating Wabiz API Key ::::: ', result)
          dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: updateWabizApiKeyAndExpireyTime(): ::::: Error while Updating Wabiz API Key ::::: catch: ', err)
        dataUpdated.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataUpdated.promise
  }

  setNamespace (namespace, wabaInformationId) {
    const deferred = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.setNamespace(), [namespace, wabaInformationId])
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          deferred.resolve(true)
        } else {
          __logger.error('businessAccount: setNamespace(): Error while updating namespace: ', result)
          deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('businessAccount: setNamespace(): catch: ', err)
        deferred.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return deferred.promise
  }
}

module.exports = businesAccountService
