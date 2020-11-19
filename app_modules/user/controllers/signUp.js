const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const UserService = require('../services/dbData')
const addTempTfaDataBS = require('../controllers/verification').addTempTfaDataBS

/**
 * @namespace -SignUp-Controller-
 * @description SignUp API and SignUp function.
 */

/**
 * @memberof -SignUp-Controller-
 * @name SignUp
 * @path {POST} /users/signUp
 * @description Bussiness Logic :- sign up / create account (API to sign up / create account with viva connect helo-whatsapp)
 <br/><br/><b>API Documentation : </b> {@link https://stage-whatsapp.helo.ai/helowhatsapp/api/internal-docs/7ae9f9a2674c42329142b63ee20fd865/#/users/signUp|SignUp}
 * @body {string}  email - Provide the valid email for login.
 * @body {string}  password - Provide the correct password for login.
 * @body {boolean}  tncAccepted=true - Read terms and condition
 * @response {string} ContentType=application/json - Response content type.
 * @response {string} metadata.msg=Success  - Response got successfully.
 * @response {string} metadata.data.userId - Is the user is created, it will return userId in string.
 * @code {200} if the msg is success, Returns userId if user is created or if the user exist in database than it will return as User Already Exists.
 * @author Arjun Bhole 11th May, 2020
 * *** Last-Updated :- Arjun Bhole 23 October,2020 ***
 */

const controller = (req, res) => {
  __logger.info('Inside Sign up')
  const validate = new ValidatonService()
  const userService = new UserService()
  validate.signup(req.body)
    .then(valResponse => {
      __logger.info('Then1')
      return userService.createUser(req.body.email, req.body.password, req.body.tncAccepted, 'viva-portal')
    })
    .then(data => {
      __logger.info('Then 2', { data })
      return addTempTfaDataBS({ userId: data.userId, tfaType: __constants.TFA_TYPE_ENUM[1] })
    })
    .then(data => {
      __logger.info('Then 3', { data })
      delete data.userTfaId
      return res.send(data)
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = controller
