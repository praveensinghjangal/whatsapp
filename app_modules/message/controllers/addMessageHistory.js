const ValidatonService = require('../services/validation')
const MessageHistoryService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

/**
 * @namespace -WhatsApp-Message-Controller-Add-Tracking-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Add-Tracking-
 * @name Add-Tracking
 * @path {POST} /chat/v1/messages/tracking
 * @description Bussiness Logic :- This API is used to store message status in per day table, reporting db & MIS db.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
   <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message/save%20message%20status|Add-Tracking}
 * @body {string}  messageId=f194da3d-0b62-405e-a512-95797f4bcf41 - Please provide the valid messageId.
 * @body {string}  optinSource=50bdfe01-0503-487f-8b26-67a2b8fafffe - Please provide the valid optinSource.
 * @body {string}  serviceProviderId=f194da3d-0b62-405e-a512-95797f4bcf41 - Please provide the valid serviceProviderId.
 * @body {string}  deliveryChannel=whatsapp - Please provide the deliveryChannel.
 * @body {string}  statusTime=2020-07-15T13:01:08 - Please provide statusTime.
 * @body {string}  state=message-accepted - Please provide state.
 * @body {string}  endConsumerNumber=917666545750 - Please provide the valid optin Id.
 * @body {string}  businessNumber=8080808080 - Please provide the valid businessNumber.
 * @response {string} ContentType=application/json - Response content type.
 * @response {boolean} metadata.data.dataAdded=true
 * @code {200} if the msg is success than it Returns message ID.
 * @author Arjun Bhole 9th July, 2020
 * *** Last-Updated :- Arjun Bhole 9th July, 2020 ***
 */

const addMessageHistoryData = (req, res) => {
  __logger.info('add message history API called', req.body)
  const validate = new ValidatonService()
  const messageHistoryService = new MessageHistoryService()
  validate.addMessageHistory(req.body)
    .then(data => messageHistoryService.addMessageHistoryDataService(req.body))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = addMessageHistoryData
