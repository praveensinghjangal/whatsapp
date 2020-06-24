const q = require('q')
const postgresql = require('../../../lib/db').postgresql
const queryProvider = require('./queryProvider')
const __logger = require('../../../lib/logger')
const dbSchema = require('./dbSchema')

class Webhooks {
  storePayloadInDb (payload) {
    __logger.info('storePayloadInDb payload >>>>>>>>>>>>>>>>>', payload)
    const dataSaved = q.defer()
    const data = payload.notifications[0]
    postgresql.__query(queryProvider.addPayload(), [data.to, data.from, payload])
      .then(response => dataSaved.resolve(response.ops))
      .catch(err => dataSaved.reject(err))
    return dataSaved.promise
  }
}

module.exports = Webhooks
