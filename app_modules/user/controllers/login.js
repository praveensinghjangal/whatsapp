const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
const passMgmt = require('../../../lib/util/password_mgmt')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const authMiddleware = require('../../../middlewares/authentication')

const controller = (req, res) => {
  // console.log('Inside login', req.body)
  const validate = new ValidatonService()
  const password = req.body.password
  const email = req.body.email
  validate.login(req.body)
    .then(data => __db.postgresql.__query(queryProvider.getUserDetailsByEmail(email)))
    .then(results => {
      // console.log('Qquery Result', results)
      if (results.rows.length === 0) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
          data: { }
        })
      }
      const hashPassword = passMgmt.create_hash_of_password(password, results.rows[0].salt_key.toLowerCase())
      if (hashPassword.passwordHash !== results.rows[0].hash_password.toLowerCase()) { // todo : use bcrypt
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
          data: { }
        })
      }
      // console.log('Login Result', results)
      const userData = results.rows[0]
      const payload = { user_id: userData.user_id }
      const token = authMiddleware.setToken(payload, +userData.tokenExpireyInSeconds)
      return __util.send(res, {
        type: __define.RESPONSE_MESSAGES.SUCCESS,
        data: { token: token }
      })
    })
    .catch(err => {
      __logger.error('error: ', err)
      __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
    })
}

module.exports = controller
// todo : store req res selected data, logs
