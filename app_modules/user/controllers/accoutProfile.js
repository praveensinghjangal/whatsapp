const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

// Get Account Profile
const getAcountProfile = (req, res) => {
  // console.log('Inside getAcountProfile', req.params.userId)
  // console.log('Inside Sig Type', typeof (req.params.userId))
  const userId = req.user && req.user.user_id ? req.user.user_id : 0
  __db.postgresql.__query(queryProvider.getUserAccountProfile(), [userId])
    .then(results => {
      // console.log('Qquery Result getAcountProfile', results)
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

// Update Account Prfofile
const updateAcountProfile = (req, res) => {
  // console.log('Inside updateAcountProfile', req.params.userId)
  // todo : add user exists check
  const validate = new ValidatonService()
  validate.accountProfile(req.body)
    .then(data => {
    //   console.log('Data', data)
      const userId = req.user && req.user.user_id ? req.user.user_id : 0
      const city = req.body.city
      const state = req.body.state
      const country = req.body.country
      const addressLine1 = req.body.addressLine1
      const addressLine2 = req.body.addressLine2
      const contactNumber = req.body.contactNumber
      const phoneCode = req.body.phoneCode
      const postalCode = req.body.postalCode

      return __db.postgresql.__query(queryProvider.updateUserAccountProfile(), [city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, userId, userId])
    })
    .then(result => {
    //   console.log('Qquery Result updateAcountProfile', results)

      if (result && result.rowCount && result.rowCount > 0) {
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

module.exports = { getAcountProfile, updateAcountProfile }
// todo : store req res selected data, logs
