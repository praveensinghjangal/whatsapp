const q = require('q')
const mongoDb = require('../../../lib/db').mongo
const dbSchema = require('./dbSchema')
class Webhooks {
  sendToQueue (payload) {
    const dataSaved = q.defer()
    mongoDb.__insert(dbSchema.database, dbSchema.collectionName, payload || {})
      .then(response => dataSaved.resolve(response.ops))
      .catch(err => dataSaved.reject(err))
    return dataSaved.promise
  }
}

module.exports = Webhooks
