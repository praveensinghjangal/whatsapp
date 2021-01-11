const q = require('q')
const __constants = require('../../../config/constants')
const __logger = require('../../../lib/logger')
const urlValidator = require('../../../lib/util/url')

class WabaAccount {
  constructor (maxConcurrent, userId) {
    this.http = ''
  }

  getAccountInfo (wabaNumber) {
    __logger.info('Demo getAccountInfo', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: { status_code: 200, code: 2000, message: 'Success', data: { whatsAppAccountId: 'b6210d0f-acb3-4dfa-8b52-0972c8045706', whatsAppAccountName: 'Helo.ai', businessName: 'Vivaconnect Pvt Ltd', templateNamespace: '71b5eef0_78fe_4950_8890_3504637de60d', facebookBusinessManagerId: 237143287394373, whatsAppBusinessAccountId: 566872327347183, accountStatus: { messageOnBehalf: 'APPROVED' }, managedBy: { accountName: 'vivaconn1cpaas' } } } })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  updateProfilePic (wabaNumber, profilePicBuffer) {
    __logger.info('Demo updateProfilePic', wabaNumber)
    const deferred = q.defer()
    deferred.resolve({ type: __constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
    return deferred.promise
  }

  getAccountPhoneNoList (wabaNumber) {
    __logger.info('Demo getAccountPhoneNoList', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: { status_code: 200, code: 2000, message: 'Success', data: [{ phoneNumber: '918080800808', displayPhoneNumber: '+91 80808 00808', verifiedName: 'VivaConnect Pvt Ltd', qualityRating: 'GREEN', status: 'CONNECTED', whatsAppAccountId: 'b6210d0f-acb3-4dfa-8b52-0972c8045706', managedBy: { accountName: 'vivaconn1cpaas' }, messagingVia: { accountName: 'vivaconn1cpaas' } }] } })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  getCurrentProfile (wabaNumber) {
    __logger.info('Demo getCurrentProfile', wabaNumber)
    const deferred = q.defer()
    if (wabaNumber) {
      deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: { status_code: 200, code: 2000, message: 'Success', data: { address: 'bccabccabccabccabccabccabccabccabccabccabccabcc', description: 'available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7available 24/7avai', email: 'abcd@efgh.ij', vertical: 'Non-profit', websites: ['https://stage-whatsapp.helo.ai/', 'http://abc.com'], about: 'available up-date22' } } })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  updateProfile (wabaNumber, wabaData) {
    __logger.info('inside demo update profile', wabaNumber, wabaData)
    const deferred = q.defer()
    if (wabaNumber && wabaData) {
      deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
      return deferred.promise
    } else {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Missing WabaNumber' })
      return deferred.promise
    }
  }

  setWebhook (wabaNumber, incomingMessageUrl, statusUrl) {
    __logger.info('inside setWebhook -->', wabaNumber, incomingMessageUrl, statusUrl)
    const deferred = q.defer()
    if (!wabaNumber || (!incomingMessageUrl && !statusUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide either incomingMessageUrl or statusUrl along with wabaNumber.' })
      return deferred.promise
    }
    if (incomingMessageUrl && !urlValidator.isValidHttp(incomingMessageUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide valid https URL for incomingMessageUrl.' })
      return deferred.promise
    }
    if (statusUrl && !urlValidator.isValidHttp(statusUrl)) {
      deferred.reject({ type: __constants.RESPONSE_MESSAGES.INVALID_REQUEST, err: 'Please provide valid https URL for statusUrl.' })
      return deferred.promise
    }
    deferred.resolve({ ...__constants.RESPONSE_MESSAGES.SUCCESS, data: {} })
    return deferred.promise
  }
}

module.exports = WabaAccount
