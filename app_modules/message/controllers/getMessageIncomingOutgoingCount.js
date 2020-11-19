const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')

/**
 * @namespace -WhatsApp-Message-Controller-Transaction-Message-
 * @description API’s related to whatsapp message.
 */

/**
 * @memberof -WhatsApp-Message-Controller-Transaction-Message-
 * @name GetIncomingOutgoingMessageCount
 * @path {GET} /chat/v1/messages/transaction
 * @description Bussiness Logic :- Use this API to get incoming, outgoing and total message transaction count.
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
   <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/message-history/getMessageTransactionCount|GetIncomingOutgoingMessageCount}
 * @param {string}  startDate - startDate needs to be entered here.
 * @param {string}  endDate - endDate needs to be entered here
 * @param {string}  transactionType - transactionType to be entered here i.e incoming or outgoing
 * @response {string} ContentType=application/json - Response content type.
 * @response {number} metadata.data.incomingMessageCount - Counts of Incoming message
 * @response {number} metadata.data.outgoingMessageCount - Counts of Outgoing message
 * @response {number} metadata.data.totalMessageCount - Total Counts of message
 * @code {200} if the msg is success than it Returns counts of message transaction type
 * @author Javed K11 9th September, 2020
 * *** Last-Updated :- Javed K11 9th September, 2020 ***
 */

const getIncomingOutgoingMessageCount = (req, res) => {
  __logger.info('Get Incoming and Outgoing Message Count API Called', req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const flag = req.query.transactionType ? req.query.transactionType.toLowerCase() : ''
  req.query.flag = flag
  validate.transactionValidator(req.query)
    .then(invalid => dbServices.getIncomingOutgoingMessageCount(userId, req.query.startDate, req.query.endDate, flag))
    .then(data => {
      __logger.info('Incoming -----then 2', { data })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error::getIncomingAndOutgoingMessage count : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getIncomingOutgoingMessageCount
