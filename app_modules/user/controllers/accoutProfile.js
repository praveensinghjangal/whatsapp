const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/constants')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const UserService = require('../services/dbData')
const rejectionHandler = require('../../../lib/util/rejectionHandler')

// Get Account Profile
const getAcountProfile = (req, res) => {
  __logger.info('Inside getAcountProfile', req.user.userId)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  __db.postgresql.__query(queryProvider.getUserAccountProfile(), [userId])
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

// Update Account Prfofile
const updateAcountProfile = (req, res) => {
  __logger.info('Inside updateAcountProfile', req.user.user_id)
  const userService = new UserService()

  // User Id exist check
  userService.checkUserIdExistsForAccountProfile(req.user.user_id)
    .then(result => {
      __logger.info('UserId exist check then 1', result.exists)
      if (result.exists) {
        const validate = new ValidatonService()

        return validate.accountProfile(req.body)
      } else {
        return rejectionHandler({ type: __define.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .then(data => {
      __logger.info('then 2', data)

      const userId = req.user && req.user.user_id ? req.user.user_id : '0'
      const city = req.body.city
      const state = req.body.state
      const country = req.body.country
      const addressLine1 = req.body.addressLine1
      const addressLine2 = req.body.addressLine2
      const contactNumber = req.body.contactNumber
      const phoneCode = req.body.phoneCode
      const postalCode = req.body.postalCode
      const firstName = req.body.firstName
      const lastName = req.body.lastName
      const accountManagerName = req.body.accountManagerName
      const accountTypeId = req.body.accountTypeId ? req.body.accountTypeId : constants.ACCOUNT_PLAN_TYPE.Prepaid

      return __db.postgresql.__query(queryProvider.updateUserAccountProfile(), [city, state, country, addressLine1, addressLine2, contactNumber, phoneCode, postalCode, firstName, lastName, accountManagerName, accountTypeId, userId, userId])
    })
    .then(result => {
      __logger.info('then 3', result)

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

module.exports = { getAcountProfile, updateAcountProfile }
