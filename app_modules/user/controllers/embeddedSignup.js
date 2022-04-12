const _ = require('lodash')
const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
// const UserService = require('../services/dbData')
const integrationService = require('../../../app_modules/integration')

/**
 * @namespace -Embedded-SignUp-Controller-
 * @description Embedded SignUp API.
 */

/**
 * @memberof -Embedded-SignUp-Controller-
 * @name Embedded-SignUp
 * @path {POST} /users/embedded/signup
 * @description Bussiness Logic :- Embedded Signup api should be called after the Fb login flow in viva connect helo-whatsapp. This api is used to link client's waba with our waba
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/embedded/signup|EmbeddedSignUp}
 * @body {string}  email - Provide the valid email for login.
 * @body {string}  password - Provide the correct password for login.
 * @body {boolean}  tncAccepted=true - Read terms and condition
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.userId - Is the user is created, it will return userId in string.
 * @code {200} if the msg is success, Returns userId if user is created or if the user exist in database than it will return as User Already Exists.
 * @author Vivek Thakkar 11th May, 2020
 * *** Last-Updated :- Vivek Thakkar 23 October,2020 ***
 */

const controller = (req, res) => {
  __logger.info('Inside Sign up')
  const validate = new ValidatonService()
  const systemUserIdBSP = __config.systemUserIdBSP
  let wabaIdOfClient
  //   const userService = new UserService()
  req.user = { providerId: 'a4f03720-3a33-4b94-b88a-e10453492183', userId: '1234' }
  const embeddedSignupService = new integrationService.EmbeddedSignup(req.user.providerId, req.user.userId, __config.authorization)
  validate.embeddedSignup(req.body)
    .then(valResponse => {
      req.body.inputToken = 'EAAG0ZAQUaL3wBAOZAjcO3BcCC0VZAZBiZCkHCaDlx60MQesC9xcQQI6WVTzcQJvryeul5kjT71zTDgnDPxOrInVL9amso4iwX4U3a87kI9DZByko7YrtzXJ26RGxa0DnSmc2FmSiMT18aWCnsqFQPjLNheRaVPV6lvq7Qjc9miz0L7LG3CBdCZApoeAWWmflbwdwXXFmV2Eif25FdkZBuKPV'
      // get the waba id of client's account using client's inputToken
      return embeddedSignupService.getWabaOfClient(req.body.inputToken, 'wabaNumber')
    })
    .then(debugData => {
      const granularScopes = debugData.granular_scopes
      const whatsappBusinessManagement = _.find(granularScopes, { scope: 'whatsapp_business_management' })
      wabaIdOfClient = whatsappBusinessManagement.target_ids[0]
      // get waba information by waba id. This data will be used to call inhouse-whatsapp-api
      return embeddedSignupService.getWabaDetailsByWabaId(wabaIdOfClient, 'wabaNumber')
    })
    // .then(data => {
    //   // get the list of system users linked to the bsp's waba
    //   return embeddedSignupService.getBSPsSystemUserIds('wabaNumber')
    // })
    .then(data => {
      // add system user to client's waba
      return embeddedSignupService.addSystemUserToWabaOfClient(systemUserIdBSP, wabaIdOfClient, 'wabaNumber')
    })
    .then(data => {
      // fetch assigned users to waba
      return data
    })
    .then(data => {
      // get id of business credit line of bsp
      return data
    })
    .then(data => {
      // attach business credit line id to client's waba
      return data
    })
    .then(data => {
      // verify that the line of credit was shared correctly
      return data
    })
    .then(data => {
      // subscribe app to client's waba
      return data
    })
    .then(data => {
      __logger.info('Then 3', { data })
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = controller
