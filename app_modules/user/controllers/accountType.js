const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

/**
 * @namespace -Account-Type-Controller-
 * @description In this Conroller , functionality related to Account Type exists.
 */

/**
 * @memberof -Account-Type-Controller-
 * @name GetAcountType
 * @path {GET} /users/accountType
 * @description Bussiness Logic :- This API returns the dropdown of all account type
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/accountProfile/accountType-dropdown|GetAcountType}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data - Returns the array with user_account_type_id and type_name.
 * @code {200} if the msg is success than Returns dropdown of all account type
 * @author Arjun Bhole 25th May, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */
// Get Account Type
const getAcountType = (req, res) => {
  __logger.info('Inside getAcountType', req.user)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getAccountType(), [])
    .then(results => {
      __logger.info('Then 1', { results })
      if (results && results.length > 0) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SUCCESS,
          data: results
        })
      } else {
        return rejectionHandler({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: {}, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

// Update Account Type todo
const updateAcountType = (req, res) => {
  __logger.info('Inside updateAcountType')
}

module.exports = { getAcountType, updateAcountType }
