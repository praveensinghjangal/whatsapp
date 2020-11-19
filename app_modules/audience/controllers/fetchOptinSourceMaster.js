const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

/**
 * @namespace -Whatsapp-Audience-Controller-Get-Optin-Source-Data-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof -Whatsapp-Audience-Controller-Get-Optin-Source-Data-
 * @name GetOptinSourceData
 * @path {GET} /audience/optin/source
 * @description Bussiness Logic :- This API returns all the optin source which are active in the system.
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - It will return the object containing optinSourceId and optinSource.
 * @code {200} if the msg is success than it Returns the optin source data in array of json format
 * @author Arjun Bhole 17th July, 2020
 * *** Last-Updated :- Danish Galiyara 20th July, 2020 ***
 */
// Get Optin Data
const getOptinSourceData = (req, res) => {
  // __logger.info('Inside getOptinSourceData', req.user.userId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getOptinSourceData(), [])
    .then(results => {
      __logger.info('Then 1')
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

module.exports = { getOptinSourceData }
