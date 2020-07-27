const q = require('q')
const __db = require('../../../lib/db')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

class RedirectService {
  getWabaDataByPhoneNumber (wabaNumber) {
    __logger.info('inside getWabaDataByPhoneNumber', wabaNumber)
    const dataFetched = q.defer()
    __db.redis.get(wabaNumber)
      .then(data => {
        // console.log('dataatatatat', data, typeof data)
        if (data) {
          data = JSON.parse(data)
          dataFetched.resolve(data)
        } else {
          dataFetched.reject({ type: __constants.RESPONSE_MESSAGES.WABA_PHONE_NUM_NOT_EXISTS, err: {}, data: {} })
        }
      })
      .catch(err => dataFetched.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err }))
    return dataFetched.promise
  }
}

module.exports = RedirectService
