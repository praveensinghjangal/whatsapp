const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const _ = require('lodash')

/**
 * @memberof -Template-Controller-
 * @name GetTemplateCount
 * @path {GET} /templates/count
 * @description Bussiness Logic :- This api returns templates count
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/templates/getTemplateCount|GetTemplateCount}
 * @response {string} ContentType=application/json - Response content type.
 * @response {array} metadata.data.statusCount - In response we get array of json data consist of statusName and templateCount in each object.
 * @code {200} if the msg is success than it return the different templates count with statusName.
 * @author Arjun Bhole 5th June, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

const getTemplateCount = (req, res) => {
  __logger.info('Get Templates Count API Called')
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getTemplateCountByStatus(), [userId])
    .then(data => {
      __logger.info('formatAndReturnTemplateCount', { data })
      const result = {}
      result.statusCount = []
      result.allocatedTemplateCount = data.length > 0 ? data[0].templates_allowed : 0
      result.usedTemplateCount = 0
      _.each(__constants.TEMPLATE_STATUS, singleStatus => {
        const recordData = _.find(data, obj => obj.status_name ? obj.status_name.toLowerCase() === singleStatus.displayName.toLowerCase() : false)
        if (!recordData) {
          result.statusCount.push({ templateCount: 0, statusName: singleStatus.displayName })
        } else {
          result.usedTemplateCount += recordData.count
          result.statusCount.push({ templateCount: recordData.count, statusName: singleStatus.displayName })
        }
      })
      __logger.info('Result ', { result })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { getTemplateCount }
