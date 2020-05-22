const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const passMgmt = require('../../../lib/util/password_mgmt')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const authMiddleware = require('../../../middlewares/authentication')
const UserService = require('../services/dbData')
// const UserService = require('../../../sampleDocuments/')
const path = require('path')

const controller = (req, res) => {
  __logger.info('Inside login')
  // const filePath = '../../../sampleDocuments/'
  // const fileName = 'Test.pdf'
  // res.download(path.join(filePath, fileName))
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
        return __util.send(res, { type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED, data: null })
      }

      const userData = results[0]
      const payload = { user_id: userData.user_id }
      const token = authMiddleware.setToken(payload, __define.CUSTOM_CONSTANT.SESSION_TIME)
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.SUCCESS, data: { token: token, emailVerifiedStatus: results[0].email_verified, phoneVerifiedStatus: results[0].phone_verified, tncAccepted: results[0].tnc_accepted } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = controller
