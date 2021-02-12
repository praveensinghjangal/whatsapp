const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')
const HttpService = require('../../../lib/http_service')

/**
 * @namespace -Web-Hook-Controller-
 * @description Web hook API’s provided to our vendors to send incoming messages.
 */

/**
 * @memberof -Web-Hook-Controller-
 * @name TyntecQueueStatus
 * @path {POST} /web-hooks/tyntec/queue/messageStatus/eaa82947-06f0-410a-bd2a-768ef0c4966e
 * @description Bussiness Logic :-Web hook API for tytntec to receive incoming message and store in queue
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/web-hooks/tyntec/sendMessageStatusData|TyntecQueueStatus}
 * @body {object}  key - accepts any json input and pushes to queue
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Request-Accepted  - Request data procceed successfully.
 * @code {202} Accepts input object and sends to queue
 * @author Danish Galiyara 12th Feb, 2021
 * *** Last-Updated :- Danish Galiyara 12th Feb, 2021 ***
 */

module.exports = (req, res) => {
  sendToTyntecQueue(req.body)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

const sendToTyntecQueue = (message) => {
  __logger.info('sendToTyntecQueue', message)
  const messageRouted = q.defer()
  const httpService = new HttpService(60000)
  __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.tyntecIncoming, JSON.stringify(message))
    .then(queueRes => httpService.Post(message, 'body', 'https://api-whatsapp.helo.ai/helowhatsapp/api/web-hooks/tyntec/queue/incomingdata/e464e894-0ded-4122-86bc-4e215f9f8f5a', {}))
    .then(queueResponse => messageRouted.resolve(true))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
