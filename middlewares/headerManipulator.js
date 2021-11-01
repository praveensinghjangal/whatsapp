const UniqueId = require('./../lib/util/uniqueIdGenerator')
const uniqueId = new UniqueId()

// for removing headers for security purpose & add req log id
module.exports = (req, res, next) => {
  res.removeHeader('Transfer-Encoding')
  res.removeHeader('X-Powered-By')
  req.headers.vivaReqId = uniqueId.uuid()
  next()
}
