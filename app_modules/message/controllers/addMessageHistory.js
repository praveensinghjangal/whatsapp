const ValidatonService = require('../services/validation')
const MessageHistoryService = require('../services/dbData')
const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

const addMessageHistoryData = (req, res) => {
  __logger.info('add message history API called', req.body)
  const validate = new ValidatonService()
  const messageHistoryService = new MessageHistoryService()
  validate.addMessageHistory(req.body)
    .then(data => messageHistoryService.addMessageHistoryDataService(req.body))
    .then(data => __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data }))
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = addMessageHistoryData
