const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const __config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp
const controller = (req, res) => {
  const validate = new ValidatonService()
  req.user.providerId = __config.service_provider_id.facebook
  validate.embeddedSignup(req.body)
    .then(validateData => {
      console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', req.user)
      validateData.providerId = req.user.providerId
      validateData.userId = req.user.user_id
      validateData.createdBy = req.user.user_id
      validateData.inputToken = req.body.inputToken
      validateData.authTokenOfWhatsapp = req.headers.authorization
      return rabbitmqHeloWhatsapp.sendToQueue(__constants.MQ.wabaSetUpConsumerQueue, JSON.stringify(validateData))
    })
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      return __util.send(res, { type: err.type, err: err.err })
    })
}
module.exports = controller
