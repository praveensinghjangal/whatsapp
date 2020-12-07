const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

class WabaStatusService {
  canUpdateWabaStatus (newStatusId, oldStatusId) {
    __logger.info('canUpdateWabaStatus::', { WABA_STATUS_MAPPING: __constants.WABA_STATUS_MAPPING[oldStatusId], newStatusId })
    if (__constants.WABA_STATUS_MAPPING[oldStatusId] && __constants.WABA_STATUS_MAPPING[oldStatusId].includes(newStatusId)) return true
    return false
  }
}

module.exports = WabaStatusService
