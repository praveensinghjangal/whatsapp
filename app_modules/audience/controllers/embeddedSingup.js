const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __config = require('../../../config')
const __logger = require('../../../lib/logger')
const integrationService = require('../../integration')

const embeddedSignUp = (req, res) => {
  const embeddedSignup = new integrationService.EmbeddedSignup('a4f03720-3a33-4b94-b88a-e10453492183', 'userId', __config.authorization)
  const inputToken = 'EAAG0ZAQUaL3wBABKH7r0xjgd026YJU0ks7UNmT6kPH92ZAOhkxeQchT7xurBtqtYFwo1xV0qLCJbe4FYuiuMROhKaAvI7mBlZASqOWTksmUqJ9mFgXLvfGVpbnSWO3bxZBqZArraFtGm0oZBvGiAM6pTKy99EXXROdtV7jUGsT2z1spLJGOXBd13ipsrKTU3MxHZCaBWyaPnpXjGjxCJnGe'
  embeddedSignup.getWabaOfClient(inputToken, 'wabaNumber')
    .then(data => {
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: data })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
    })
}

module.exports = { embeddedSignUp }
