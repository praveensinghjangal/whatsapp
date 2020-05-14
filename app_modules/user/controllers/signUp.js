const ValidatonService = require('../services/validation')
const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __define = require('../../../config/define')
const UserService = require('../services/dbData')

const controller = (req, res) => {
  // console.log('Inside Sign up')
  const validate = new ValidatonService()
  const userService = new UserService()
  validate.signup(req.body)
    .then(valResponse => userService.createUser(req.body.email, req.body.password, 'viva-portal'))
    .then(data => {
      return __util.send(res, { type: __define.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = controller
// todo : store req res selected data, logs
