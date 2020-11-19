const __logger = require('../../../lib/logger')
const __util = require('../../../lib/util')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const q = require('q')
/**
 * @memberof -Web-Hook-Controller-
 * @name TyntecQueueIncomingData
 * @path {POST} /web-hooks/tyntec/queue/incomingdata/e464e894-0ded-4122-86bc-4e215f9f8f5a
 * @description Bussiness Logic :-Web hook API for tytntec to receive incoming messages and store in queue
 * @auth This route requires HTTP Basic Authentication in Headers such as { "Authorization":"SOMEVALUE"}, user can obtain auth token by using login API. If authentication fails it will return a 401 error (Invalid token in header).
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/web-hooks/tyntec/sendDataToQueue|TyntecQueueIncomingData}
 * @body {object}  key - accepts any json input and pushes to queue
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Request-Accepted  - Request data procceed successfully.
 * @code {202} Accepts input object and sends to queue
 * @author Arjun Bole 23rd June, 2020
 * *** Last-Updated :- Arjun Bole 23rd June, 2020 ***
 */

module.exports = (req, res) => {
  sendToTyntecQueue(req.body)
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.ACCEPTED, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

const sendToTyntecQueue = (message) => {
  __logger.info('sendToTyntecQueue', message)
  const messageRouted = q.defer()
  __db.rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.tyntecIncoming, JSON.stringify(message))
    .then(queueResponse => messageRouted.resolve(true))
    .catch(err => messageRouted.reject(err))
  return messageRouted.promise
}
