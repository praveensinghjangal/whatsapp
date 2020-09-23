const __util = require('../lib/util')
const __constants = require('../config/constants')
const { Base64 } = require('../lib/util/encodeDecode')
const HttpService = require('../lib/http_service')
const __config = require('../config')
const __logger = require('../lib/logger')

module.exports = (req, res, next) => {
  __logger.info('Bearer token---', req.headers.authorization)
  if (req.headers && req.headers.authorization) {
    const base64 = new Base64()
    let str = base64.decode(req.headers.authorization.split(' ')[1])
    str = str.split(':')
    const url = __config.base_url + __constants.INTERNAL_END_POINTS.userLogin
    const http = new HttpService(60000)
    return http.Post({ email: str[0], password: str[1] }, 'body', url, '')
      .then((data) => {
        if (data.body.code !== 2000) {
          __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, err: {} })
        } else {
          __logger.info('email&pass matched status code--', data.body.code)
          return next()
        }
      })
  } else {
    __util.send(res, { type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED, err: {} })
  }
}
