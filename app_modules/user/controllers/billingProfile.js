const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
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
    .then(results => {
      __logger.info('Then 1', results)

      if (results && results.rows.length > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: results.rows[0]
        })
      } else {
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// Add Business Profile
const addBusinessBilllingProfileOld = (req, res) => {
  __logger.info('Inside getBusinessBilllingProfile', req.user.user_id)
  const uniqueId = new UniqueId()

  const userService = new UserService()
  userService.checkUserIdExistForBusiness(req.user.user_id)
    .then(exists => {
      __logger.info('Then 1', exists)

      if (!exists) {
        const validate = new ValidatonService()
        return validate.businessProfile(req.body)
      } else {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.RECORD_EXIST, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('Inside Query execution function then 2', data)
      const userId = req.user && req.user.user_id ? req.user.user_id : 0
      const city = req.body.city
      const state = req.body.state
      const country = req.body.country
      const addressLine1 = req.body.addressLine1
      const addressLine2 = req.body.addressLine2
      const contactNumber = req.body.contactNumber
      const phoneCode = req.body.phoneCode
      const postalCode = req.body.postalCode
      const GstOrTaxNo = req.body.GstOrTaxNo
      const businessName = req.body.businessName
      const panCard = req.body.panCard
      const tokenExpiryInSeconds = 864000
      return __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, businessName, city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, uniqueId.intId(), userId, tokenExpiryInSeconds])
    })
    .then(result => {
      __logger.info('Then 3', result)

      if (result && result.rowCount && result.rowCount > 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { }
        })
      } else {
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.PROCESS_FAILED, data: {} })
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
    __db.postgresql.__query(queryProvider.getBillingProfileWithBusinessInfoId(), [userId])
      .then((data) => {
        __logger.info('Then 1 update', data)
        businessInfo = data.rows[0]
        return __db.postgresql.__query(queryProvider.updateIsActiveStatusBusinessProfile(), [false, userId, userId])
      })
      .then(result => {
        __logger.info('Then 2 update')

        const city = businessData.city ? businessData.city : businessInfo.city
        const state = businessData.state ? businessData.state : businessInfo.state
        const country = businessData.country ? businessData.country : businessInfo.country
        const addressLine1 = businessData.addressLine1 ? businessData.addressLine1 : businessInfo.addressLine1
        const addressLine2 = businessData.addressLine2 ? businessData.addressLine2 : businessInfo.addressLine2
        const contactNumber = businessData.contactNumber ? businessData.contactNumber : businessInfo.contactNumber
        const phoneCode = businessData.phoneCode ? businessData.phoneCode : businessInfo.phoneCode
        const postalCode = businessData.postalCode ? businessData.postalCode : businessInfo.postalCode
        const GstOrTaxNo = businessData.GstOrTaxNo ? businessData.GstOrTaxNo : businessInfo.GstOrTaxNo
        const businessName = businessData.businessName ? businessData.businessName : businessInfo.businessName
        const panCard = businessData.panCard ? businessData.panCard : businessInfo.panCard
        const tokenExpiryInSeconds = 864000

        return __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, businessName, city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, businessInfo.business_information_id, userId, tokenExpiryInSeconds])
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
  const uniqueId = new UniqueId()
  const userId = req.user && req.user.user_id ? req.user.user_id : 0

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
        const city = req.body.city
        const state = req.body.state
        const country = req.body.country
        const addressLine1 = req.body.addressLine1
        const addressLine2 = req.body.addressLine2
        const contactNumber = req.body.contactNumber
        const phoneCode = req.body.phoneCode
        const postalCode = req.body.postalCode
        const GstOrTaxNo = req.body.GstOrTaxNo
        const businessName = req.body.businessName
        const panCard = req.body.panCard
        const tokenExpiryInSeconds = 864000
        return __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, businessName, city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, uniqueId.intId(), userId, tokenExpiryInSeconds])
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
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.PROCESS_FAILED, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addBusinessBilllingProfile, getBusinessBilllingProfile, updateBusinessBilllingProfile }
