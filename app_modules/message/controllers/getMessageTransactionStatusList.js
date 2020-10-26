const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const DbServices = require('../services/dbData')
const ValidatonService = require('../services/validation')

const getMessageTransactionstatusList = (req, res) => {
  __logger.info('Get Message Transaction List API Called', req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page field is required with value as number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage field is required with value as number' })
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  const flag = req.query.transactionType ? req.query.transactionType.toLowerCase() : null
  req.query.flag = flag
  validate.transactionValidator(req.query)
    .then(invalid => dbServices.getMessageTransactionList(userId, req.query.startDate, req.query.endDate, flag, ItemsPerPage, offset))
    .then(data => {
      __logger.info('Data------> then 2', data)
      const pagination = { totalPage: Math.ceil(data[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
    })
    .catch(err => {
      __logger.error('error::getMessageTransactionList : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageTransactionstatusList
