const integrationService = require('../../integration')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')

const controller = (req, res) => {
  const validate = new ValidatonService()
  req.jwtToken = { providerId: 'f1d44200-4b9d-4901-ae49-5035e0b14a5d' } // todo: replace with actual jwt data
  // validate.sendMessage(req.body)
  //   .then(data => {
  const messageService = new integrationService.Messaage(req.jwtToken.providerId)
  messageService.sendMessage(req.body)
  // return messageService.sendMessage(req.body)
    // })
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} }))
    .catch(err => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
}

module.exports = controller
// todo : store req res selected data, logs, integrate session auth
