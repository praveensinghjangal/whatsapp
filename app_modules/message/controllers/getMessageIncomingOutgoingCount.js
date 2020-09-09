const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')

const getIncomingOutgoingMessageCount = (req, res) => {
  __logger.info('Get Incoming and Outgoing Message Count API Called', req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const flag = req.query.transactionType ? req.query.transactionType.toLowerCase() : ''
  req.query.flag = flag
  validate.transactionValidator(req.query)
    .then(invalid => dbServices.getIncomingOutgoingMessageCount(userId, req.query.startDate, req.query.endDate, flag))
    .then(data => {
      __logger.info('Incoming -----', data)
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error::getIncomingAndOutgoingMessage count : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getIncomingOutgoingMessageCount
