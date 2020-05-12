const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const constants = require('../../../config/define')
const uuid4 = require('uuid4')
const passMgmt = require('../../../lib/util/password_mgmt')
const __define = require('../../../config/define')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

const controller = (req, res) => {
  // console.log('Inside Sign up')
  const validate = new ValidatonService()
  validate.signup(req.body)
    .then(data => {
      const userId = uuid4() // todo : will use mongo id here
      const email = req.body.email
      const password = req.body.password
      const passwordSalt = passMgmt.genRandomString(16)
      const hashPassword = passMgmt.create_hash_of_password(password, passwordSalt).passwordHash
      const tokenExpireyInSeconds = req.body.tokenExpireyInSeconds
      __db.postgresql.__query(queryProvider.createUser(email, hashPassword, userId, passwordSalt, tokenExpireyInSeconds))
    })
    .then(results => {
      if (results) {
        __util.send(res, {
          type: __define.RESPONSE_MESSAGES.SUCCESS,
          data: { message: 'User created successfully', userId: results.user_id }
        })
      } else {
        __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error: ', err)

      if (err.code === 23505) {
        return __util.send(res, {
          type: __define.RESPONSE_MESSAGES.INVALID_REQUEST,
          data: { message: 'User already exists' }
        })
      } else {
        __util.send(res, { type: constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      }
    })
}

module.exports = controller
// todo : store req res selected data, logs
