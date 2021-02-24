const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')

class AgreementStatusService {
  canUpdateAgreementStatus (newStatusId, oldStatusId) {
    __logger.info('canUpdateAgreementStatus::', oldStatusId, { TEMPLATE_STATUS_MAPPING: __constants.AGREEMENT_STATUS_MAPPING[oldStatusId], newStatusId })
    return __constants.AGREEMENT_STATUS_MAPPING[oldStatusId] && __constants.AGREEMENT_STATUS_MAPPING[oldStatusId].includes(newStatusId)
  }

  getAgreementStatusName (agreementCode) {
    const result = _(__constants.AGREEMENT_STATUS)
      .filter(c => c.statusCode === agreementCode)
      .map('displayName')
      .value()

    if (result && result.length > 0) {
      return result[0]
    } else {
      return null
    }
  }
}

module.exports = AgreementStatusService
