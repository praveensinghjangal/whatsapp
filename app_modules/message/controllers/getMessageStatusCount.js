const _ = require('lodash')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')

/**
 * @namespace -WhatsApp-Message-Controller-StatusCount-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-StatusCount-
 * @name Status-Count
 * @path {GET} /chat/v1/messages/status/count
 * @description Bussiness Logic :-Use this API to get message status count.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/getMessageCount|GetMessageStatusCount}
 * @param  startDate - startDate needs to be entered here
 * @param  endDate - endDate needs to be entered here
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - This API return the object as [ { "code": 2000, "msg": "Success", "data": [ { "state": "deleted", "stateCount": 1 }, { "state": "in process", "stateCount": 192 } ] }]
 * @code {200} if the msg is success than it Returns various state counts of message journey.
 * @author Javed kh11 7th September, 2020
 * *** Last-Updated :- Javed kh11 7th September, 2020 ***
 */

const getMessageStatusCount = (req, res) => {
  __logger.info('Get Message Status Count API Called', req.query)
  __logger.info('startDate and endDate----->', req.query.startDate, req.query.endDate)
  const validate = new ValidatonService()
  const dbServices = new DbServices()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validate.checkstartDateAndendDate(req.query)
    .then(isvalid => dbServices.getMessageCount(userId, req.query.startDate, req.query.endDate))
    .then(data => {
      __logger.info('db count data ----->then 2', { data })
      const dataOut = []
      _.each(__constants.MESSAGE_STATUS_FOR_DISPLAY, singleStatus => {
        const statusData = _.find(data, obj => obj.state.toLowerCase() === singleStatus.toLowerCase())
        if (!statusData) {
          dataOut.push({ state: singleStatus, stateCount: 0 })
        } else {
          dataOut.push(statusData)
        }
      })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: dataOut })
    })
    .catch(err => {
      __logger.error('error::getMessageStatusCount : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageStatusCount
