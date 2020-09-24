const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const passMgmt = require('../../../lib/util/password_mgmt')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const authMiddleware = require('../../../middlewares/auth/authentication')
const UserService = require('../services/dbData')

const controller = (req, res) => {
  __logger.info('Inside login')

  const validate = new ValidatonService()
  const userService = new UserService()
  const password = req.body.password
  const email = req.body.email
  validate.login(req.body)
    .then(data => {
      __logger.info('Then 1', data)
      return userService.getUSerDataByEmail(email)
    })
    .then(results => {
      __logger.info('Then 2', results)
      const hashPassword = passMgmt.create_hash_of_password(password, results[0].salt_key.toLowerCase())
      if (hashPassword.passwordHash !== results[0].hash_password.toLowerCase()) { // todo : use bcrypt
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: null })
      }
      const userData = results[0]
      if (userData.is_tfa_enabled === 0) {
        const payload = { user_id: userData.user_id }
        const token = authMiddleware.setToken(payload, __constants.CUSTOM_CONSTANT.SESSION_TIME)
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { token: token, emailVerifiedStatus: results[0].email_verified === 1, phoneVerifiedStatus: results[0].phone_verified === 1, tncAccepted: results[0].tnc_accepted === 1, role: results[0].role_name, tfaType: results[0].tfa_type } })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { emailVerifiedStatus: results[0].email_verified === 1, phoneVerifiedStatus: results[0].phone_verified === 1, tncAccepted: results[0].tnc_accepted === 1, role: results[0].role_name, userId: userData.user_id, tfaType: results[0].tfa_type } })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = controller
