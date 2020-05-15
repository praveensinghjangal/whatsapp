const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')

// Get Business Profile
const getBusinessBilllingProfile = (req, res) => {
  // console.log('Inside getBusinessBilllingProfile', req.params.userId)

  if (!req.params.userId) {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId not provided' }
    })
  };

  if (typeof (req.params.userId) !== 'string') {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId provided is invalid' }
    })
  }

  const userId = req.params.userId // todo : will use mongo id here

  __db.postgresql.__query(queryProvider.getBillingProfile(), [userId])
    .then(results => {
      // console.log('Qquery Result getAcountProfile', results)

      if (results) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: results.rows[0]
        })
      } else {
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err })
    })
}

// Add Business Profile
const addBusinessBilllingProfile = (req, res) => {
  //   console.log('Inside addBusinessBilllingProfile', req.body)

  if (!req.params.userId) {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId not provided' }
    })
  };

  if (typeof (req.params.userId) !== 'string') {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId provided is invalid' }
    })
  }

  const validate = new ValidatonService()
  validate.businessProfile(req.body)
    .then(data => {
      //   console.log('Data', data)
      const userId = req.params.userId // todo : will use mongo id here
      const city = req.body.city
      const state = req.body.state
      const country = req.body.country
      const addressLine1 = req.body.address_line_1
      const addressLine2 = req.body.address_line_2
      const contactNumber = req.body.contactNumber
      const phoneCode = req.body.phoneCode
      const postalCode = req.body.postalCode
      const GstOrTaxNo = req.body.GstOrTaxNo
      const businessName = req.body.businessName
      const panCard = req.body.panCard
      const tokenExpiryInSeconds = 600

      return __db.postgresql.__query(queryProvider.createBusinessBillingProfile(), [userId, businessName, city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, new UniqueId().intId(), userId, tokenExpiryInSeconds])
    })
    .then(results => {
      //   console.log('Qquery Result updateAcountProfile', results)

      if (results) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { }
        })
      } else {
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

//  Update Business Profile
const updateBusinessBilllingProfile = (req, res) => {
  //   console.log('Inside updateBusinessBilllingProfile', req.body)

  if (!req.params.userId) {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId not provided' }
    })
  };

  if (typeof (req.params.userId) !== 'string') {
    return __util.send(res, {
      type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
      err: { message: 'userId provided is invalid' }
    })
  }

  const validate = new ValidatonService()
  validate.businessProfile(req.body)
    .then(data => {
      //   console.log('Data', data)
      const userId = req.params.userId // todo : will use mongo id here
      const city = req.body.city
      const state = req.body.state
      const country = req.body.country
      const addressLine1 = req.body.address_line_1
      const addressLine2 = req.body.address_line_2
      const contactNumber = req.body.contactNumber
      const phoneCode = req.body.phoneCode
      const postalCode = req.body.postalCode
      const GstOrTaxNo = req.body.GstOrTaxNo
      const businessName = req.body.businessName
      const panCard = req.body.panCard

      return __db.postgresql.__query(queryProvider.updateBusinessBillingProfile(), [city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, panCard, GstOrTaxNo, businessName, userId, userId])
    })
    .then(results => {
      //   console.log('Qquery Result updateAcountProfile', results)

      if (results) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { }
        })
      } else {
        return __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addBusinessBilllingProfile, getBusinessBilllingProfile, updateBusinessBilllingProfile }
// todo : store req res selected data, logs
