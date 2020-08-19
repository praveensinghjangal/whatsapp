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

class businesAccountService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
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
    // declare a prmoise
    const doesUserIdExist = q.defer()
    // checking using service whether the userId is  provided or not
    this.validate.checkUserIdService({ userId })
    // then using a query to check that a record exist or not in table
      .then(valResponse => {
        return __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getWabaTableDataByUserId(), [userId])
      })
      .then(result => {
        // if exist throw return true exist
        if (result && result.length > 0) {
          result[0].canReceiveSms = result[0].canReceiveSms === 1
          result[0].canReceiveVoiceCall = result[0].canReceiveVoiceCall === 1
          result[0].associatedWithIvr = result[0].associatedWithIvr === 1
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

  insertBusinessData (userId, businessData, businessOldData) {
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
      profilePhotoUrl: businessData.profilePhotoUrl ? businessData.profilePhotoUrl : businessOldData.profilePhotoUrl,
      wabaProfileSetupStatusId: businessData.wabaProfileSetupStatusId ? businessData.wabaProfileSetupStatusId : businessOldData.wabaProfileSetupStatusId,
      businessManagerVerified: typeof businessData.businessManagerVerified === 'boolean' ? businessData.businessManagerVerified : businessOldData.businessManagerVerified,
      phoneVerified: typeof businessData.phoneVerified === 'boolean' ? businessData.phoneVerified : businessOldData.phoneVerified,
      wabaInformationId: businessOldData.wabaInformationId ? businessOldData.wabaInformationId : this.uniqueId.uuid(),
      city: businessData.city ? businessData.city : businessOldData.city,
      postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
      serviceProviderId: businessData.serviceProviderId ? businessData.serviceProviderId : businessOldData.serviceProviderId,
      apiKey: businessData.apiKey ? businessData.apiKey : businessOldData.apiKey,
      webHookPostUrl: businessData.webHookPostUrl ? businessData.webHookPostUrl : businessOldData.webHookPostUrl,
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : false
    }

    this.checkWabaNumberAlreadyExist(businessData.phoneCode, businessData.phoneNumber, businessOldData.userId, __constants.TAG.insert)
      .then(() => __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.addWabaTableData(), [businessAccountObj.facebookManagerId, businessAccountObj.phoneCode, businessAccountObj.phoneNumber, businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.profilePhotoUrl, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webHookPostUrl, businessAccountObj.optinText, businessAccountObj.chatBotActivated]))
      .then(result => {
        if (result && result.affectedRows && result.affectedRows > 0) {
          dataInserted.resolve(businessAccountObj)
        } else {
          dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        dataInserted.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return dataInserted.promise
  }

  /* To do the handling of facebook manager id when null  */
  updateBusinessInfo (userId, businessData, businessOldData) {
    const dataUpdated = q.defer()
    __logger.info('Inputs insertBusinessData userId', userId)
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
      profilePhotoUrl: businessData.profilePhotoUrl ? businessData.profilePhotoUrl : businessOldData.profilePhotoUrl,
      wabaProfileSetupStatusId: businessData.wabaProfileSetupStatusId ? businessData.wabaProfileSetupStatusId : businessOldData.wabaProfileSetupStatusId,
      businessManagerVerified: typeof businessData.businessManagerVerified === 'boolean' ? businessData.businessManagerVerified : businessOldData.businessManagerVerified,
      phoneVerified: typeof businessData.phoneVerified === 'boolean' ? businessData.phoneVerified : businessOldData.phoneVerified,
      wabaInformationId: businessOldData.wabaInformationId ? businessOldData.wabaInformationId : this.uniqueId.uuid(),
      city: businessData.city ? businessData.city : businessOldData.city,
      postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
      serviceProviderId: businessData.serviceProviderId ? businessData.serviceProviderId : businessOldData.serviceProviderId,
      apiKey: businessData.apiKey ? businessData.apiKey : businessOldData.apiKey,
      webHookPostUrl: businessData.webHookPostUrl ? businessData.webHookPostUrl : businessOldData.webHookPostUrl,
      optinText: businessData.optinText ? businessData.optinText : businessOldData.optinText,
      chatBotActivated: typeof businessData.chatBotActivated === 'boolean' ? businessData.chatBotActivated : false
    }
    const redisService = new RedisService()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.updateWabaTableData(), [businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.profilePhotoUrl, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode, businessAccountObj.facebookManagerId, businessAccountObj.serviceProviderId, businessAccountObj.apiKey, businessAccountObj.webHookPostUrl, businessAccountObj.optinText, businessAccountObj.chatBotActivated, businessAccountObj.wabaInformationId, userId])
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

  updateBusinessData (businessData, businessOldData) {
    const businessDataUpdated = q.defer()
    // this.deactivateWabaRecord(businessOldData.wabaInformationId, businessOldData.userId)
    // .then(data => this.insertBusinessData(businessOldData.userId, businessData, businessOldData))
    if (businessData.phoneNumber && !businessOldData.phoneNumber) {
      this.checkWabaNumberAlreadyExist(businessData.phoneCode, businessData.phoneNumber, businessOldData.userId, __constants.TAG.update)
        .then(() => this.updateWabaNumberAndPhoneCode(businessOldData.userId, businessData.phoneCode, businessData.phoneNumber))
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
        businessDataFetched.resolve(businessData[0].userId)
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
        // console.log('resulttttttttttttttttttttttttttt', result[0], wabaNumber)
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

  updateWabaNumberAndPhoneCode (userId, phoneCode, phoneNumber) {
    /* To do
       Update all the tables with waba Number
       currently updating only waba info table
    */
    const dataUpdated = q.defer()

    const wabaData = {
      phoneCode: phoneCode,
      phoneNumber: phoneNumber,
      updatedBy: userId,
      userId: userId
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
}

module.exports = businesAccountService
