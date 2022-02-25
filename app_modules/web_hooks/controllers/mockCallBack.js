const __config = require('../../../config')
const __constants = require('../../../config/constants')
const request = require('request')
const __logger = require('../../../lib/logger')

const controller = (req, res) => {
  // __logger.info('Input', req.body)
  if (req.body && req.body.event && (req.body.event.toLowerCase() === 'momessage' || req.body.event.toLowerCase() === 'momessage::postback')) {
    const inputData = []
    __config.mockWebHook.receiverNumber.forEach(number => {
      inputData.push({
        to: number,
        channels: [
          'whatsapp'
        ],
        whatsapp: {
          from: __config.mockWebHook.senderNumber,
          contentType: 'text',
          text: JSON.stringify(req.body)
        }
      })
    })

    const url = __config.base_url + __constants.INTERNAL_END_POINTS.sendMessageToQueue
    // __logger.info('Url>>>>>>>>>>>>>>>>>>>>>>>>', typeof url)
    const options = {
      url,
      body: inputData,
      headers: { Authorization: __config.mockWebHook.authorization, 'User-Agent': __constants.INTERNAL_CALL_USER_AGENT },
      json: true
    }
    // Calling another api for sending messages
    request.post(options, (err, httpResponse, body) => {
      __logger.info('responseeeeeeeeeeeeeeeeeee', err, { body })
      if (err) {
        return res.send(err)
      }
      return res.send(body)
    })
  } else {
    res.status(202).send()
  }
}

module.exports = controller
