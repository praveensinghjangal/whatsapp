const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

/**
 * @memberof -Whatsapp-Business-Account-(WABA)-Controller-
 * @name GetBusinessCategory
 * @path {GET} /business/categories
 * @description Bussiness Logic :- Gets list of business categories.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/WABA/businesscategories|GetBusinessCategory}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {array} metadata.data - Array of all the category_name with its business_category_id.
 * @code {200} if the msg is success than return List of all business categories.
 * @author Arjun Bhole 29th May, 2020
 * *** Last-Updated :- Arjun Bhole 29th May, 2020 ***
 */

// Get Business Category
const getBusinessCategory = (req, res) => {
  __logger.info('Inside getBusinessCategory', req.user.userId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getBusinessCategory(), [])
    .then(result => {
      __logger.info('Then 1')
      if (result && result.length > 0) {
        return __util.send(res, {
          type: __constants.RESPONSE_MESSAGES.SUCCESS,
          data: result
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

module.exports = { getBusinessCategory }
