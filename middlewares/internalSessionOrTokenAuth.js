const authTokens = require('../config/index').authTokens
const authMiddleware = require('./authentication')
const authstrategy = require('../config').authentication.strategy

module.exports = (req, res, next) => {
  if (req.headers.authorization && authTokens.includes(req.headers.authorization)) {
    return next()
  } else {
    return authMiddleware.authenticate(authstrategy.jwt.name, authstrategy.jwt.options)(req, res, next)
  }
}
