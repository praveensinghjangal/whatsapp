const _ = require('lodash')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const __util = require('../../../lib/util')
const ValidatonService = require('../services/validation')
const DbServices = require('../services/dbData')

const getMessageStatusCount = (req, res) => {
  __logger.info('Get Message Status Count API Called', req.query)
  __logger.info('startDate and endDate----->', req.query.startDate, req.query.endDate)
  const validate = new ValidatonService()
  const dbServices = new DbServices()
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  validate.checkstartDateAndendDate(req.query)
    .then(isvalid => dbServices.getMessageCount(userId, req.query.startDate, req.query.endDate))
    .then(data => {
      __logger.info('db count data ----->then 2', { data })
      _.each(__constants.MESSAGE_STATUS, singleStatus => { if (!_.find(data, obj => obj.state.toLowerCase() === singleStatus.toLowerCase())) data.push({ state: singleStatus, stateCount: 0 }) })
      __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data })
    })
    .catch(err => {
      __logger.error('error::getMessageStatusCount : ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = getMessageStatusCount
