const integrationService = require('../../integration')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')

const controller = (req, res) => {
  const validate = new ValidatonService()
  req.jwtToken = { providerId: 111 } // todo: replace with actual jwt data
  validate.sendMessage(req.body)
    .then(data => {
      const messageService = new integrationService.Messaage(req.jwtToken.providerId)
      return messageService.sendMessage(req.body)
    })
    .then(data => __util.send(res, { type: constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

module.exports = controller
// todo : store req res selected data, logs, integrate session auth
