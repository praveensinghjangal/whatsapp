const __util = require('../../lib/util')
const __constants = require('../../config/constants')
const privateAuthTokens = require('../../config/index').privateAuthTokens

module.exports = (req, res, next) => {
  if (req.headers.authorization && privateAuthTokens.includes(req.headers.authorization)) {
    return next()
  } else {
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, err: {} })
  }
}
