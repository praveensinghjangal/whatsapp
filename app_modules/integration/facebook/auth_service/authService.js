const q = require('q')
// const _ = require('lodash')
const __constants = require('../../../../config/constants')
const __logger = require('../../../../lib/logger')
// const rejectionHandler = require('../util/rejectionHandler')
// const HttpService = require('../../service/httpService')
// const WabaService = require('../../../whatsapp_business/services/businesAccount')
const RedisService = require('../../../../lib/redis_service/redisService')
// const moment = require('moment')

// class InternalFunctions {
//   WabaLoginApi (username, password) {
//     console.log('hit api and retrun data.apiToken')
//     const http = new HttpService(60000)

//     const apiCalled = q.defer()
//     const url = 'https://10.40.13.240:9090/v1/users/login'
//     // const data = 'admin:Pass@123'
//     const data = `${username}:${password}`
//     // const buff = new Buffer(data)
//     const buff = new Buffer(data)

//     const base64data = buff.toString('base64')
//     const headers = { Authorization: `Basic ${base64data}` }
//     const inputRequest = { }

//     http.Post(inputRequest, 'body', url, headers)
//       .then(data => {
//         __logger.info('post metadata api response', data)
//         data = data.body || data
//         if (data) {
//           apiCalled.resolve(data.users[0].token)
//         } else if (data.msg === __constants.RESPONSE_MESSAGES.NOT_AUTHORIZED.message) {
//           apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: { } })
//         } else {
//           apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, err: { } })
//         }
//       })
//       .catch(err => apiCalled.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err }))
//     return apiCalled.promise
//   }
// }

class AuthService {
  getWabaTokenByPhoneNumber (wabaNumber) {
    __logger.info('inside getWabaTokenByPhoneNumber', wabaNumber)
    const dataFetched = q.defer()
    const redisService = new RedisService()
    redisService.getWabaDataByPhoneNumber(wabaNumber)
    // __db.redis.get(wabaNumber)
      .then(data => {
        if (data && data.expiresOn) {
          return this.setFunction(data)
        } else {

        }

        // console.log(data.expires_after)
        // if (data.apiKey) {
        //   console.log('data in auth', data)
        //   return data
        // } else {
        //   return this.setFunction(data)
        // }

        // __logger.info('dataatatatatwaba ==> ', data, typeof data)
      })
      .then(data => dataFetched.resolve(data))
      .catch(err => {
        __logger.error('error in auth', err)
        dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return dataFetched.promise
  }
}

module.exports = AuthService
