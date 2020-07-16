const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const MessageHistoryService = require('../services/dbData')
const ValidatonService = require('../services/validation')

const getMessageHistoryRecordById = (req, res) => {
  __logger.info('Get Message History Info API Called', req.params)
  const messageHistoryService = new MessageHistoryService()
  const validate = new ValidatonService()
  validate.checkMessageIdExistService(req.params)
    .then(data => messageHistoryService.getMessageHistoryTableDataWithId(req.params.messageId))
    .then(result => {
      __logger.info('then 1', result)
      if (result) {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
      } else {
        return __util.send(res, { type: __constants.RESPONSE_MESSAGES.NO_RECORDS_FOUND, data: {} })
      }
    })
    .catch(err => {
      __logger.error('error in create user function: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageHistoryRecordById
