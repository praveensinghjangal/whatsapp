const ValidatonService = require('../services/validation')
const CheckInfoCompletionService = require('../services/checkCompleteIncomplete')
const __util = require('../../../lib/util')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const UserService = require('../services/dbData')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const q = require('q')

// Get Business Profile
const getBusinessBilllingProfile = (req, res) => {
  __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  let queryResult = []
  __db.postgresql.__query(queryProvider.getBillingProfile(), [userId])
    .then(results => {
      __logger.info('Then 1', results)
      queryResult = results.rows[0]
      if (results && results.rows.length > 0) {
        return checkBusinessProfileCompletionStatus(results.rows[0])
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .then(data => {
      __logger.info('then 2')
      queryResult.complete = data.complete
      return __util.send(res, {
        type: __define.RESPONSE_MESSAGES.SUCCESS,
        data: queryResult
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

//  Update Business Profile
function updateBusinessBilllingProfile (userId, oldBusinessData, businessDataToBeUpdated) {
  // __logger.info('Inside updateBusinessBilllingProfile oldBusinessData', oldBusinessData)
  // __logger.info('Inside updateBusinessBilllingProfile businessDataToBeUpdated', businessDataToBeUpdated)
  // __logger.info('Inside updateBusinessBilllingProfile', userId)

  return new Promise((resolve, reject) => {
    updateBusinessProfileIsActiveStatusToFalse(userId)
      .then(result => {
        __logger.info('Then 1 update')

        const businessDataObj = {
          city: businessDataToBeUpdated.city ? businessDataToBeUpdated.city : oldBusinessData.city,
          state: businessDataToBeUpdated.state ? businessDataToBeUpdated.state : oldBusinessData.state,
          country: businessDataToBeUpdated.country ? businessDataToBeUpdated.country : oldBusinessData.country,
          addressLine1: businessDataToBeUpdated.addressLine1 ? businessDataToBeUpdated.addressLine1 : oldBusinessData.addressLine1,
          addressLine2: businessDataToBeUpdated.addressLine2 ? businessDataToBeUpdated.addressLine2 : oldBusinessData.addressLine2,
          contactNumber: businessDataToBeUpdated.contactNumber ? businessDataToBeUpdated.contactNumber : oldBusinessData.contactNumber,
          phoneCode: businessDataToBeUpdated.phoneCode ? businessDataToBeUpdated.phoneCode : oldBusinessData.phoneCode,
          postalCode: businessDataToBeUpdated.postalCode ? businessDataToBeUpdated.postalCode : oldBusinessData.postalCode,
          gstOrTaxNo: businessDataToBeUpdated.gstOrTaxNo ? businessDataToBeUpdated.gstOrTaxNo : oldBusinessData.gstOrTaxNo,
          businessName: businessDataToBeUpdated.businessName ? businessDataToBeUpdated.businessName : oldBusinessData.businessName,
          panCard: businessDataToBeUpdated.panCard ? businessDataToBeUpdated.panCard : oldBusinessData.panCard,
          tokenExpiryInSeconds: 864000,
          businessInformationId: oldBusinessData.business_information_id
        }

        return insertBusinessBillingProfileInfo(userId, {}, businessDataObj)
      })
      .then(result => {
        __logger.info('Then 2 update', result)

        if (result && result.rowCount && result.rowCount > 0) {
          return resolve({ rowCount: result.rowCount, complete: result.complete })
        } else {
          return rejectionHandler({ type: __define.RESPONSE_MESSAGES.PROCESS_FAILED, data: {} })
        }
      })
      .catch(err => {
        __logger.error('error: ', err)
        return rejectionHandler({ type: err.type, err: err.err, data: {} })
      })
  })
}

// Add Business Profile
const addBusinessBilllingProfile = (req, res) => {
  __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'

  const validate = new ValidatonService()
  validate.businessProfile(req.body)
    .then(data => {
      __logger.info(' then 1')

      const userService = new UserService()
      return userService.checkUserIdExistForBusiness(userId)
    })
    .then(result => {
      /* If exists then updating else inserting */
      __logger.info('Inside Query execution function then 2', result)

      if (!result.exists) {
        return insertBusinessBillingProfileInfo(userId, req.body, {})
      } else {
        return updateBusinessBilllingProfile(userId, result.record, req.body)
      }
    })
    .then(result => {
      __logger.info('Then 3', result)

      if (result && result.rowCount && result.rowCount > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { complete: result.complete }
        })
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.PROCESS_FAILED, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// Function to insert data
function insertBusinessBillingProfileInfo (userId, businessData, businessOldData) {
  __logger.info('Inputs insertBusinessBillingProfileInfo userId', userId)
  // __logger.info('Inputs businessData', businessData)
  // __logger.info('Inputs businessOldData', businessOldData)

  const uniqueId = new UniqueId()
  let queryResult

  const billingObj = {
    city: businessData.city ? businessData.city : businessOldData.city,
    state: businessData.state ? businessData.state : businessOldData.state,
    country: businessData.country ? businessData.country : businessOldData.country,
    addressLine1: businessData.addressLine1 ? businessData.addressLine1 : businessOldData.addressLine1,
    addressLine2: businessData.addressLine2 ? businessData.addressLine2 : businessOldData.addressLine2,
    contactNumber: businessData.contactNumber ? businessData.contactNumber : businessOldData.contactNumber,
    phoneCode: businessData.phoneCode ? businessData.phoneCode : businessOldData.phoneCode,
    postalCode: businessData.postalCode ? businessData.postalCode : businessOldData.postalCode,
    gstOrTaxNo: businessData.gstOrTaxNo ? businessData.gstOrTaxNo : businessOldData.gstOrTaxNo,
    businessName: businessData.businessName ? businessData.businessName : businessOldData.businessName,
    panCard: businessData.panCard ? businessData.panCard : businessOldData.panCard,
    tokenExpiryInSeconds: 864000,
    businessInformationId: businessOldData.businessInformationId ? businessOldData.businessInformationId : uniqueId.uuid()
  }

  // __logger.info('Billing Obj', billingObj)

  return new Promise((resolve, reject) => {
    __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, billingObj.businessName, billingObj.city, billingObj.state, billingObj.country, billingObj.addressLine1, billingObj.addressLine2, billingObj.contactNumber, billingObj.phoneCode, billingObj.postalCode, billingObj.panCard, billingObj.gstOrTaxNo, billingObj.businessInformationId, userId, billingObj.tokenExpiryInSeconds])
      .then(result => {
        queryResult = result
        return checkBusinessProfileCompletionStatus(billingObj)
      })
      .then(data => {
        __logger.info('then 1')

        // __logger.info('queryResult', queryResult)
        // __logger.info('data', data)
        return resolve({ rowCount: queryResult.rowCount, complete: data.complete })
      })
      .catch(err => {
        __logger.error('error: ', err)
        return rejectionHandler({ type: err.type, err: err.err, data: {} })
      })
  })
}

// Function to get business info by id
function getBusinessProfileInfo (userId) {
  return __db.postgresql.__query(queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
}

// Function to update is active status for business
function updateBusinessProfileIsActiveStatusToFalse (userId) {
  return __db.postgresql.__query(queryProvider.updateIsActiveStatusBusinessProfile(), [false, userId, userId])
}

function checkBusinessProfileCompletionStatus (data) {
  const checkCompleteStatus = new CheckInfoCompletionService()

  return checkCompleteStatus.checkBusinessProfileStatus(data)
}

module.exports = { addBusinessBilllingProfile, getBusinessBilllingProfile, updateBusinessBilllingProfile, insertBusinessBillingProfileInfo, getBusinessProfileInfo, updateBusinessProfileIsActiveStatusToFalse }
