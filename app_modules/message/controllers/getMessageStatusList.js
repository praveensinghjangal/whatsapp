const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')

const getMessageStatusList = (req, res) => {
  __logger.info('Get Message Status List API Called', req.params, req.query)
  const dbServices = new DbServices()
  const validate = new ValidatonService()
  if (isNaN(req.query.page)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'Page value is required and it should be number' })
  if (isNaN(req.query.ItemsPerPage)) return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, data: {}, err: 'ItemsPerPage value is required and it should be number' })
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const requiredPage = req.query.page ? +req.query.page : 1
  const ItemsPerPage = +req.query.ItemsPerPage
  const offset = ItemsPerPage * (requiredPage - 1)
  console.log('Get Offset value', offset)
  validate.checkstartDateAndendDate(req.query)
    .then(invalid => dbServices.getMessageStatusList(req.params.status, req.query.startDate, req.query.endDate, ItemsPerPage, offset, userId))
    .then(data => {
      const pagination = { totalPage: Math.ceil(data[1][0].totalCount / ItemsPerPage), currentPage: requiredPage }
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { rows: data[0], pagination } })
    })
    .catch(err => {
      __logger.error('error::getMessageStatusList : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageStatusList
