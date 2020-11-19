const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const MessageHistoryService = require('../services/dbData')
const ValidatonService = require('../services/validation')

/**
 * @namespace -WhatsApp-Message-Controller-Fetch-Tracking-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Fetch-Tracking-
 * @name Fetch-Tracking
 * @path {GET} /chat/v1/messages/tracking/{messageId}
 * @description Bussiness Logic :- Use this API to get complete journey of a message You need to pass messageId in path.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
  <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/getMessageStatus|Fetch-Tracking}
 * @param {string}  messageId=f194da3d-0b62-405e-a512-95797f4bcf41 - Please provide the valid messageId.
 * @response {string} ContentType=application/json - Response content type.
 * @response {object} metadata.data - In response we get array of json data consist of messageId,statusTime,deliveryChannel,state,endConsumerNumber,businessNumber in each object.
 * @code {200} if the msg is success than it Returns various stages of message journey.
 * @author Arjun Bhole 9th July, 2020
 * *** Last-Updated :- Arjun Bhole 23rd October, 2020 ***
 */

const getMessageHistoryRecordById = (req, res) => {
  __logger.info('Get Message History Info API Called', req.params)
  const messageHistoryService = new MessageHistoryService()
  const validate = new ValidatonService()
  validate.checkMessageIdExistService(req.params)
    .then(data => messageHistoryService.getMessageHistoryTableDataWithId(req.params.messageId))
    .then(result => {
      __logger.info('then 1', { result })
      if (result) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageHistoryRecordById
