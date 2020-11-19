const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const rejectionHandler = require('../../../lib/util/rejectionHandler')
const queryProvider = require('../queryProvider')

/**
 * @namespace -Whatsapp-Audience-Controller-Fetch-Segment-
 * @description API’s related to whatsapp audience.
 */

/**
 * @memberof  -Whatsapp-Audience-Controller-Fetch-Segment-
 * @name GetSegmentData
 * @path {GET} audience/optin/segment
 * @description Bussiness Logic :- This API returns all the optin segment data.
 * @response {string} ContentType=application/json - Response content type.
 * @code {200} if the msg is success than it Returns all the optin segment data.
 * @author Arjun Bhole 16th July, 2020
 * *** Last-Updated :- Arjun Bhole 16th July, 2020 ***
 */

// Get Segment Data
const getSegmentData = (req, res) => {
  __logger.info('Inside getSegmentData', req.user.userId)
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getSegmentData(), [])
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

module.exports = { getSegmentData }
