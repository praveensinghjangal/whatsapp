/**
 * @namespace authenticate
 * @description authentication logic
 * @author deepak.ambekar [5/25/2017].
 */
var jwt = require('jwt-simple')
var dateUtil = require('date-format-utils')
var auth = {}
var _ = require('lodash')
const __logger = require('../logger')
const __util = require('../util')
const __constants = require('../../config/constants')

// region JWT auth

function authenticate (request, response, next) {
  if (request.method == 'OPTIONS') {
    __logger.debug('Auth options')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    response.setHeader('access-control-expose-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
  } else {
    var serviceUrl = request.originalUrl
    __logger.debug('Auth Started for ' + serviceUrl)
    // Write your authentication logic here
    try {
      var queryToken = null
      if (request.query) {
        queryToken = request.query.authorization || request.query.Authorization || null
      }
      var token = request.headers.authorization || queryToken || null
      if (!__util.isEmpty(token)) {
        var decoded = jwt.decode(token, __config.authConfig.secretKey)
        __logger.debug('decoded msg::', JSON.stringify(decoded))
        if (decoded.expire_at <= Date.now()) {
          __logger.debug('Token Force Expire done, expire_at:', dateUtil.formatDate(decoded.expire_at, 'hh:mm:ss tt'))
          __util.send(response, {
            type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED,
            data: { message: 'Unauthorized access. Token expire.' }
          })
        } else {
          request.decoded = decoded
          request.payload = decoded.payload
          if (decoded.skip_inactive) {
            __logger.debug('Token authorized [skip inactive]')
            next()
          } else {
            var inactiveTime = 0
            if (decoded.last_modified < Date.now()) {
              inactiveTime = Math.abs((Date.now() - decoded.last_modified) / 60000)
            }
            if (inactiveTime >= __config.authConfig.inactiveTimeFrame) {
              __logger.debug('Token Expire due to inactive')
              __util.send(response, {
                type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED,
                data: { message: 'Unauthorized access. Token expire due to inactive.' }
              })
            } else {
              __logger.debug('Token authorized [check inactive]')
              var newToken = generateToken(decoded.payload, decoded.expire_at)
              response.setHeader('Authorization', newToken)
              next()
            }
          }
        }
      } else {
        __logger.warn('UNAUTHORIZED ACCESS!! Empty Token. req format:: ', { remote_host: request.ip, uri: request.url, req_id: request.id })
        __util.send(response, {
          type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED
        })
      }
    } catch (e) {
      __logger.error('UNAUTHORIZED ACCESS!! Decode failed. req format:: ', { remote_host: request.ip, uri: request.url, req_id: request.id })
      __util.send(response, {
        type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED
      })
    }

    __logger.debug('Auth Finish')
  }
};
auth.authenticate = authenticate

function generateToken (payload, expire_at, skip_inactive) {
  var last_modified = Date.now()
  if (__util.isEmpty(expire_at)) {
    var time = 60 * 60
    if (__config.authConfig.forceExpireTimeFrame && typeof __config.authConfig.forceExpireTimeFrame === 'number') { time = __config.authConfig.forceExpireTimeFrame * 60} else { __logger.debug('Default 60min force expire time frame set.')}
    expire_at = __util.expiresAt(time)
  }
  var token_payload = {
    expire_at: expire_at,
    payload: payload
  }
  if (!skip_inactive) {
    token_payload.last_modified = last_modified
  } else {
    token_payload.skip_inactive = skip_inactive
  }
  var token = jwt.encode(token_payload, __config.authConfig.secretKey)

  return token
}
auth.generateToken = generateToken

// endregion

// region client api authentication
function authenticateApikey (request, response, next) {

}

// endregion

// region api access key auth

function authenticateAccessKey (request, response, next) {
  var serviceUrl = request.originalUrl
  if (request.method == 'OPTIONS') {
    __logger.debug('Auth options')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    response.setHeader('access-control-expose-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
  } else {
    __logger.debug('Auth Started for ' + serviceUrl)
    // Write your authentication logic here
    try {
      var accesskey = request.body.accesskey || request.headers.accesskey || request.query.accesskey || null
      if (_.isEmpty(accesskey)) {
        __logger.warn('UNAUTHORIZED ACCESS!! req format:: ', { remote_host: request.req_ip, uri: request.url, req_id: request.id })
        __util.send(response, {
          type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED,
          data: null
        })
      } else if (accesskey != __config.authConfig.apiAccessKey) {
        __logger.warn('UNAUTHORIZED ACCESS!! req format:: ', { remote_host: request.req_ip, uri: request.url, req_id: request.id })
        __util.send(response, {
          type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED,
          data: null
        })
      } else {
        __logger.debug('AUTHORIZED ACCESS!! req format:: ', { remote_host: request.req_ip, uri: request.url, req_id: request.id })
        next()
      }
    } catch (e) {
      __logger.warn('UNAUTHORIZED ACCESS!! req format:: ', { remote_host: request.req_ip, uri: request.url, req_id: request.id })
      __util.send(response, {
        type: __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED
      })
    }
  }
}
auth.authenticateAccessKey = authenticateAccessKey

// endregion

module.exports = auth
