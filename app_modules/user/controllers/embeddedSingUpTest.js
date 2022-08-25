const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const __config = require('../../../config')
const rabbitmqHeloWhatsapp = require('../../../lib/db').rabbitmqHeloWhatsapp

/**
 * @memberof -Authenticate-Module-
 * @name controller
 * @path {POST} /signup/embeddedtest
 * @description Bussiness Logic :- this api is embedded signup API  .this api will hit after the i- frame close
    <br/><br/><b>API Documentation : </b> {@link http://stage-iam.helo.ai/iam/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/authenticate/auth/login|Login}
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - the success data will send to wabaset-up-consumer Worker
 * @response {string} after sucessfull login insert addUserLoginDetails in user_login table
 * @code {200} if the msg is success, Returns sucesss and process will contiue
 * @author Shivam singh 24th May, 2022
 * *** Last-Updated :- Shivam singh 24th May, 2022 ***
 */

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
