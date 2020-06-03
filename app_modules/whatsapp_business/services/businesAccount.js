const q = require('q')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('./validation')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')

class businesAccountService {
  constructor () {
    this.validate = new ValidatonService()
    this.uniqueId = new UniqueId()
  }

  deactivateWabaRecord (wabaInformationId) {
    const recordDeactivated = q.defer()
    __logger.info('Setting is active false to waba record', wabaInformationId)
    __db.postgresql.__query(queryProvider.setIsActiveFalseByWabaId(), [wabaInformationId])
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
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
        return __db.postgresql.__query(queryProvider.getWabaTableDataByUserId(), [userId])
      })
      .then(result => {
        // if exist throw return true exist
        if (result && result.rowCount && result.rowCount > 0) {
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

  insertBusinessData (userId, businessData, businessOldData) {
    const dataInserted = q.defer()
    __logger.info('Inputs insertBusinessData userId', userId)
    const businessAccountObj = {
      facebookManagerId: businessData.facebookManagerId ? businessData.facebookManagerId : businessOldData.facebookManagerId,
      phoneCode: businessData.phoneCode ? businessData.phoneCode : businessOldData.phoneCode,
      phoneNumber: businessData.phoneNumber ? businessData.phoneNumber : businessOldData.phoneNumber,
      canReceiveSms: businessData.canReceiveSms ? businessData.canReceiveSms : businessOldData.canReceiveSms,
      canReceiveVoiceCall: businessData.canReceiveVoiceCall ? businessData.canReceiveVoiceCall : businessOldData.canReceiveVoiceCall,
      associatedWithIvr: businessData.associatedWithIvr ? businessData.associatedWithIvr : businessOldData.associatedWithIvr,
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
      businessManagerVerified: businessData.businessManagerVerified ? businessData.businessManagerVerified : businessOldData.businessManagerVerified,
      phoneVerified: businessData.phoneVerified ? businessData.phoneVerified : businessOldData.phoneVerified,
      wabaInformationId: businessOldData.wabaInformationId ? businessOldData.wabaInformationId : this.uniqueId.uuid(),
      city: businessData.city ? businessData.city : businessOldData.city,
      postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode
    }
    __db.postgresql.__query(queryProvider.addWabaTableData(), [businessAccountObj.facebookManagerId, businessAccountObj.phoneCode, businessAccountObj.phoneNumber, businessAccountObj.canReceiveSms, businessAccountObj.canReceiveVoiceCall, businessAccountObj.associatedWithIvr, businessAccountObj.businessName, businessAccountObj.state, businessAccountObj.whatsappStatus, businessAccountObj.description, businessAccountObj.address, businessAccountObj.country, businessAccountObj.email, businessAccountObj.businessCategoryId, businessAccountObj.profilePhotoUrl, businessAccountObj.wabaProfileSetupStatusId, businessAccountObj.businessManagerVerified, businessAccountObj.phoneVerified, businessAccountObj.wabaInformationId, userId, userId, businessAccountObj.city, businessAccountObj.postalCode])
      .then(result => {
        if (result && result.rowCount && result.rowCount > 0) {
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

  updateBusinessData (businessData, businessOldData) {
    const businessDataUpdated = q.defer()
    this.deactivateWabaRecord(businessOldData.wabaInformationId)
      .then(data => this.insertBusinessData(businessOldData.userId, businessData, businessOldData))
      .then(insertedData => businessDataUpdated.resolve(insertedData))
      .catch(err => {
        __logger.error('error: ', err)
        businessDataUpdated.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataUpdated.promise
  }

  getBusinessProfileInfo (userId) {
    const businessDataFetched = q.defer()
    __db.postgresql.__query(queryProvider.getBusinessProfile(), [userId])
      .then(businessData => businessDataFetched.resolve(businessData))
      .catch(err => {
        __logger.error('error: ', err)
        businessDataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return businessDataFetched.promise
  }
}

module.exports = businesAccountService
