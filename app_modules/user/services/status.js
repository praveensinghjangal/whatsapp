const q = require('q')
const _ = require('lodash')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const __config = require('../../../config')
const EmailService = require('../../../lib/sendNotifications/email')

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

  sendEmailsToSupports (emails, errorMessage) {
    const sendEmail = q.defer()
    const emailService = new EmailService(__config.emailProvider)
    emailService.sendEmail(emails, 'Error While Embedded Singup', errorMessage)
      .then(result => {
        if (result) {
          sendEmail.resolve(result)
        } else {
          sendEmail.reject({ type: __constants.RESPONSE_MESSAGES.CANNOT_SEND_MESSAGE, data: {} })
        }
      })
      .catch(err => {
        sendEmail.reject({ type: err.type || __constants.RESPONSE_MESSAGES.SERVER_ERROR, err: err })
      })
    return sendEmail.promise
  }
}

module.exports = AgreementStatusService
