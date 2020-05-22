const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const UserService = require('../services/dbData')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Get Business Profile
const getBusinessBilllingProfile = (req, res) => {
  __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  __db.postgresql.__query(queryProvider.getBillingProfile(), [userId])
  // getBusinessProfileInfo(userId)
    .then(results => {
      __logger.info('Then 1', results)

      if (results && results.rows.length > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: results.rows[0]
        })
      } else {
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

//  Update Business Profile
function updateBusinessBilllingProfile (userId, businessData) {
  // __logger.info('Inside updateBusinessBilllingProfile', businessData)
  // __logger.info('Inside updateBusinessBilllingProfile', userId)

  return new Promise((resolve, reject) => {
    var businessInfo
    // __db.postgresql.__query(queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
    getBusinessProfileInfo(userId)
      .then((data) => {
        __logger.info('Then 1 update', data)
        businessInfo = data.rows[0]
        return updateBusinessProfileIsActiveStatusToFalse(userId)
        // return __db.postgresql.__query(queryProvider.updateIsActiveStatusBusinessProfile(), [false, userId, userId])
      })
      .then(result => {
        __logger.info('Then 2 update')

        const businessDataObj = {
          city: businessData.city ? businessData.city : businessInfo.city,
          state: businessData.state ? businessData.state : businessInfo.state,
          country: businessData.country ? businessData.country : businessInfo.country,
          addressLine1: businessData.addressLine1 ? businessData.addressLine1 : businessInfo.addressLine1,
          addressLine2: businessData.addressLine2 ? businessData.addressLine2 : businessInfo.addressLine2,
          contactNumber: businessData.contactNumber ? businessData.contactNumber : businessInfo.contactNumber,
          phoneCode: businessData.phoneCode ? businessData.phoneCode : businessInfo.phoneCode,
          postalCode: businessData.postalCode ? businessData.postalCode : businessInfo.postalCode,
          GstOrTaxNo: businessData.GstOrTaxNo ? businessData.GstOrTaxNo : businessInfo.GstOrTaxNo,
          businessName: businessData.businessName ? businessData.businessName : businessInfo.businessName,
          panCard: businessData.panCard ? businessData.panCard : businessInfo.panCard,
          tokenExpiryInSeconds: 864000,
          businessInformationId: businessInfo.business_information_id
        }

        return insertBusinessBillingProfileInfo(userId, businessDataObj)
      })
      .then(result => {
        __logger.info('Then 3 update', result)

        if (result && result.rowCount && result.rowCount > 0) {
          return resolve({ rowCount: result.rowCount })
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
      const userService = new UserService()
      return userService.checkUserIdExistForBusiness(userId)
    })
    .then(result => {
      /* If exists then updating else inserting */
      __logger.info('Inside Query execution function then 2', result)

      if (!result.exists) {
        return insertBusinessBillingProfileInfo(userId, req.body)
      } else {
        return updateBusinessBilllingProfile(userId, req.body)
      }
    })
    .then(result => {
      __logger.info('Then 3', result)

      if (result && result.rowCount && result.rowCount > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { }
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
function insertBusinessBillingProfileInfo (userId, businessData) {
  const uniqueId = new UniqueId()
  const city = businessData.city
  const state = businessData.state
  const country = businessData.country
  const addressLine1 = businessData.addressLine1
  const addressLine2 = businessData.addressLine2
  const contactNumber = businessData.contactNumber
  const phoneCode = businessData.phoneCode
  const postalCode = businessData.postalCode
  const GstOrTaxNo = businessData.GstOrTaxNo
  const businessName = businessData.businessName
  const panCard = businessData.panCard
  const tokenExpiryInSeconds = 864000
  const businessInformationId = businessData.businessInformationId ? businessData.businessInformationId : uniqueId.uuid()
  return __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, businessName, city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, businessInformationId, userId, tokenExpiryInSeconds])
}

// Function to get business info by id
function getBusinessProfileInfo (userId) {
  return __db.postgresql.__query(queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
}

// Function to update is active status for business
function updateBusinessProfileIsActiveStatusToFalse (userId) {
  return __db.postgresql.__query(queryProvider.updateIsActiveStatusBusinessProfile(), [false, userId, userId])
}

module.exports = { addBusinessBilllingProfile, getBusinessBilllingProfile, updateBusinessBilllingProfile, insertBusinessBillingProfileInfo, getBusinessProfileInfo, updateBusinessProfileIsActiveStatusToFalse }
