const __util = require('../lib/util')
const __constants = require('../config/constants')
const authTokens = require('../config/index').authTokens

module.exports = (req, res, next) => {
  if (req.headers.authorization && authTokens.includes(req.headers.authorization)) {
    return next()
  } else {
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, err: {} })
  }
}
