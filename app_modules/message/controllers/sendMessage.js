const integrationService = require('../../integration')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')

const controller = (req, res) => {
  const validate = new ValidatonService()
  req.jwtToken = { providerId: 'e76a602e-37e3-4c5d-898f-56bf0c880f93' } // todo: replace with actual jwt data
  validate.sendMessage(req.body)
    .then(data => {
      const messageService = new integrationService.Messaage(req.jwtToken.providerId)
      return messageService.sendMessage(req.body)
    })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

module.exports = controller
// todo : store req res selected data, logs, integrate session auth
