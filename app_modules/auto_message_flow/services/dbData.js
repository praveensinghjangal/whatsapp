const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')

class DbService {
  getEventDetailsFromIdentifierOrTopic (wabaNumber, text) {
    const eventDetails = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_NAME, queryProvider.getEventDetailsFromIdentifierOrTopic(), [wabaNumber, text.toLowerCase(), wabaNumber, text.toLowerCase()])
      .then(result => {
        __logger.info('Qquery Result', result)
        eventDetails.resolve(result)
      })
      .catch(err => {
        __logger.error('error in get getEventDetailsFromIdentifierOrTopic: ', err)
        eventDetails.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return eventDetails.promise
  }
}

module.exports = DbService
