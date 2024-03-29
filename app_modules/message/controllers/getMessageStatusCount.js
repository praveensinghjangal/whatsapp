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
 * @description Bussiness Logic :-Use this API to get messages count per status in provided date range.
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
  __logger.info('GetMessageStatusCount: API Called', { req: req.query })
  const validate = new ValidatonService()
  const dbServices = new DbServices()
  const wabaPhoneNumber = req.user && req.user.wabaPhoneNumber ? req.user.wabaPhoneNumber : '0'
  validate.checkstartDateAndendDate(req.query)
    .then(isvalid => dbServices.getMessageCount(wabaPhoneNumber, req.query.startDate, req.query.endDate))
    .then(data => {
      __logger.info('GetMessageStatusCount: validate.checkStartDateAndEndDate: then 1:', { data })
      const dataOut = []
      let dataPresent = false
      _.each(__constants.MESSAGE_STATUS_FOR_DISPLAY, singleStatus => {
        const statusData = _.find(data, obj => obj.state.toLowerCase() === singleStatus.toLowerCase())
        if (!statusData) {
          dataOut.push({ state: singleStatus, stateCount: 0 })
        } else {
          dataPresent = statusData.stateCount > 0
          dataOut.push(statusData)
        }
      })
      __util.send(res, { type: dataPresent ? __constants.RESPONSE_MESSAGES.SUCCESS : __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: dataPresent ? dataOut : null, err: dataPresent ? null : {} })
    })
    .catch(err => {
      __logger.info('GetMessageStatusCount: validate.checkStartDateAndEndDate: catch:', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageStatusCount
