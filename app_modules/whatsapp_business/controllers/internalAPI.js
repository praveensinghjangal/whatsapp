const __util = require('../../../lib/util')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const BusinessAccountService = require('../services/businesAccount')

const getWabaNumberFromUserId = (req, res) => {
  if (!req.query.userId) {
    return __util.send(res, { type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide userId' })
  }
  const businessAccountService = new BusinessAccountService()
  businessAccountService.getWabaNumberFromUserId(req.query.userId)
    .then(result => {
      __logger.info('Final Result then 4')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: result })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = {
  getWabaNumberFromUserId
}
