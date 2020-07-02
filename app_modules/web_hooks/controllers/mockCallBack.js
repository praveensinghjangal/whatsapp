const __config = require('../../../config')
const __constants = require('../../../config/constants')
const request = require('request')

const controller = (req, res) => {
  // __logger.info('Input', req.body)
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
  console.log('..........................', inputData)
  const options = {
    url,
    body: inputData,
    headers: { Authorization: __config.mockWebHook.authorization },
    json: true
  }
  // Calling another api for sending messages
  request.post(options, (err, httpResponse, body) => {
    if (err) {
      return res.send(err)
    }
    return res.send(body)
  })
}

module.exports = controller
