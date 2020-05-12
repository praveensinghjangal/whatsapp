const ValidatonService = require('../services/userValidation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
const passMgmt = require('../../../lib/util/password_mgmt')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const jwt = require('jsonwebtoken')
const __config = require('../../../config')
const queryProvider = require('../queryProvider')

const controller = (req, res) => {
  try {
    console.log('Inside login')
    const validate = new ValidatonService()
    validate.userInputValidation(req.body)
      .then((data) => {
        if (data) {
          const email = req.body.email
          const password = req.body.password

          __db.postgresql.__query(queryProvider.searchUser(email))
            .then((results) => {
              // console.log('Qquery Result', results)
              if (results.rows.length === 0) {
                __util.send(res, {
                  type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                  data: { message: 'no such user found' }
                })
              } else {
                const hashPassword = passMgmt.create_hash_of_password(password, results.rows[0].salt_key.toLowerCase())
                if (hashPassword.passwordHash !== results.rows[0].hash_password.toLowerCase()) {
                  __util.send(res, {
                    type: __define.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                    data: { message: 'no such user found' }
                  })
                }

                // console.log('Login Result', results)
                const userData = results.rows[0]
                const payload = { user_id: userData.user_id, email: userData.email }
                const token = jwt.sign(payload, __config.jwt_secret_key)
                __util.send(res, {
                  type: __define.RESPONSE_MESSAGES.SUCCESS,
                  data: { token: token }
                })
              }
            }).catch(err => {
              __logger.error('error: ', err)
              __util.send(res, {
                type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
                data: { message: 'Please contact administrator' }
              })
            })
        }
        // __util.send(res, { type: constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
      })
      .catch(err => __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
  } catch (err) {
    __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
  }
}

module.exports = controller
// todo : store req res selected data, logs, integrate session and token based auth
