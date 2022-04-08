const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const integrationService = require('../../integration')

const embeddedSignUp = (req, res) => {
  const embeddedSignup = new integrationService.EmbeddedSignup('a4f03720-3a33-4b94-b88a-e10453492183', 'userId', __config.authorization)
  embeddedSignup.getWabaOfClient('params', 'wabaNumber')
    .then(data => {
      console.log('daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = { embeddedSignUp }
