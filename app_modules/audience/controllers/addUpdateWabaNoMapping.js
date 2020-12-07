const __util = require('../../../lib/util')
const __logger = require('../../../lib/logger')
const __constants = require('../../../config/constants')
const ValidatonService = require('../services/validation')
const WabaNoMappingService = require('../services/wabaNoMapping')

const addUpdateWabaNoMapping = (req, res) => {
  __logger.info('Inside addUpdateWabaNoMapping', req.user.user_id, req.body)
  const userId = req.user && req.user.user_id ? req.user.user_id : '0'
  const validate = new ValidatonService()
  const wabaNoMappingService = new WabaNoMappingService()
  validate.wabaNoMappingInputCheck(req.body)
    .then(data => {
      __logger.info(' then 1')
      return wabaNoMappingService.checkWabaIdExist(req.body.wabaInformationId)
    })
    .then((result) => {
      __logger.info(' then 2', { result })
      if (result && !result.exists) {
        return wabaNoMappingService.addWabaNoMappingData(req.body.wabaInformationId, req.body, {}, userId)
      } else {
        return wabaNoMappingService.updateWabaNoMappingData(userId, req.body, result.record)
      }
    })
    .then(result => {
      __logger.info(' then 3')
      return __util.send(res, { type: __constants.RESPONSE_MESSAGES.SUCCESS, data: { } })
    })
    .catch(err => {
      __logger.error('error: ', err)
      return __util.send(res, { type: err.type, err: err.err })
    })
}

module.exports = { addUpdateWabaNoMapping }
