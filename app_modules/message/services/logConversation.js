const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __db = require('../../../lib/db')
const queryProvider = require('../queryProvider')
const ValidatonService = require('../services/validation')
const UniqueId = require('../../../lib/util/uniqueIdGenerator')
const uniqueId = new UniqueId()

class LogConversationInternalService {
  insertConversation (conversationId, from, to, expiresOn, type) {
    const logAdded = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.addConversationLog(), [uniqueId.uuid(), conversationId, from, to, type, expiresOn, from])
      .then(result => {
        __logger.info('Add Result then 4', { result })
        if (result && result.affectedRows && result.affectedRows > 0) {
          logAdded.resolve(true)
        } else {
          logAdded.reject({ type: __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: {} })
        }
      })
      .catch(err => {
        __logger.error('error in insertConversation: ', err, err ? err.toString() : '')
        logAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return logAdded.promise
  }

  checkConversationLogExists (conversationId) {
    __logger.info('inside checkConversationExists', conversationId)
    const doesConversationExists = q.defer()
    __db.mysql.query(__constants.HW_MYSQL_MIS_NAME, queryProvider.checkConversationLogExists(), [conversationId])
      .then(result => {
        __logger.info('checkConversationLogExists query Result', { result })
        if (result && result.length === 0) {
          doesConversationExists.resolve(false)
        } else {
          doesConversationExists.resolve(true)
        }
      })
      .catch(err => {
        __logger.error('error in checkConversationLogExists: ', err)
        doesConversationExists.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return doesConversationExists.promise
  }
}

class LogConversation {
  constructor () {
    this.logConversationInternalService = new LogConversationInternalService()
  }

  add (conversationId, from, to, expiresOn, type) {
    const logAdded = q.defer()
    const validate = new ValidatonService()
    validate.addConversationLog({ conversationId, from, to, expiresOn, type })
      .then(valBody => this.logConversationInternalService.checkConversationLogExists(conversationId))
      .then(exists => {
        if (exists) return 'ALready Added'
        return this.logConversationInternalService.insertConversation(conversationId, from, to, expiresOn, type)
      })
      .then(inserted => logAdded.resolve(true))
      .catch(err => {
        __logger.error('error in adding log: ', err, err ? err.toString() : '')
        logAdded.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err.err || err })
      })
    return logAdded.promise
  }
}

module.exports = LogConversation
